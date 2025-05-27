import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Keyboard,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Image,
  SafeAreaView,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "./styles";
import OpenAI from "openai";
import Constants from "expo-constants";
import LottieView from "lottie-react-native";
import { FAQManager } from "./FAQManager";

const apiKey =
  Constants.expoConfig?.extra?.EXPO_PUBLIC_OPENAI_API_KEY ||
  process.env.EXPO_PUBLIC_OPENAI_API_KEY;
const openai = new OpenAI({ apiKey });

// Buat instance FAQManager yang bisa digunakan di seluruh aplikasi
const faqManager = new FAQManager();

const ChatAI = () => {
  const [messages, setMessages] = useState([
    {
      id: "1",
      text: "Halo! Kawan Showsial. Ada yang bisa Cak J Bantu?",
      isUser: false,
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [faqsLoaded, setFaqsLoaded] = useState(false);
  const flatListRef = useRef(null);

  // Scroll ke bawah saat pesan baru (user atau bot)
  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current.scrollToIndex({
          index: messages.length - 1,
          animated: true,
          viewPosition: 1, // 1 artinya item terakhir akan berada di paling bawah
        });
      }, 200); // delay sedikit lebih lama agar keyboard benar-benar muncul
    }
  }, [messages]);

  // Scroll ke bawah saat keyboard muncul
  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", () => {
      if (flatListRef.current && messages.length > 0) {
        setTimeout(() => {
          flatListRef.current.scrollToEnd({ animated: true });
        }, 50);
      }
    });
    return () => showSub.remove();
  }, [messages]);

  // Memuat FAQ hanya sekali di awal
  useEffect(() => {
    const loadFAQs = async () => {
      try {
        await faqManager.fetchFAQs();
        setFaqsLoaded(true);
      } catch (err) {
        console.error("Gagal memuat FAQ:", err);
      }
    };

    loadFAQs();
  }, []);

  const formatMessagesForOpenAI = (messages) => {
    return messages.map((msg) => ({
      role: msg.isUser ? "user" : "assistant",
      content: msg.text,
    }));
  };

  const sendMessage = async () => {
    if (inputText.trim() === "") return;

    const userMessage = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputText("");
    setIsLoading(true);

    const typingMessage = {
      id: "typing-indicator",
      text: "Sedang berpikir...",
      isUser: false,
      isTyping: true,
    };
    setMessages((prev) => [...prev, typingMessage]);

    try {
      if (!apiKey) throw new Error("API key tidak tersedia.");

      // Pastikan FAQ sudah dimuat
      if (!faqsLoaded) {
        await faqManager.fetchFAQs();
      }

      // Coba cari jawaban sederhana dari FAQ terlebih dahulu
      const basicMatch = faqManager.findBasicMatch(userMessage.text);

      if (basicMatch) {
        // Jika ada kecocokan dasar, gunakan jawaban dari FAQ tanpa perlu API call
        const botResponse = {
          id: Date.now().toString() + "-bot",
          text: basicMatch,
          isUser: false,
        };

        setMessages((prev) => [
          ...prev.filter((msg) => msg.id !== "typing-indicator"),
          botResponse,
        ]);

        return;
      }

      // Jika tidak ada kecocokan dasar, gunakan OpenAI API
      // Batasi pesan yang dikirim (hanya 3 pesan terakhir)
      const recentMessages = updatedMessages.slice(-3);
      const formattedMessages = formatMessagesForOpenAI(recentMessages);

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini", // Menggunakan model yang efisien
        messages: [
          {
            role: "system",
            content: faqManager.getSystemPrompt(),
          },
          ...formattedMessages,
        ],
        temperature: 0.3,
        max_tokens: 150, // Batasi jumlah token output
      });

      const botResponse = {
        id: Date.now().toString() + "-bot",
        text: response.choices[0].message.content,
        isUser: false,
      };

      setMessages((prev) => [
        ...prev.filter((msg) => msg.id !== "typing-indicator"),
        botResponse,
      ]);
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = {
        id: Date.now().toString() + "-error",
        text: "Maaf, terjadi kesalahan saat menghubungi server.",
        isUser: false,
        isError: true,
      };

      setMessages((prev) => [
        ...prev.filter((msg) => msg.id !== "typing-indicator"),
        errorMessage,
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const dismissKeyboard = () => Keyboard.dismiss();

  const renderItem = ({ item }) => (
    <View
      style={[
        styles.messageBubble,
        item.isUser ? styles.userBubble : styles.botBubble,
        item.isError && styles.errorBubble,
      ]}
    >
      {!item.isUser && (
        <View style={styles.avatarContainer}>
          <Image
            source={require("../../assets/images/cakji.png")}
            style={styles.avatar}
          />
        </View>
      )}
      <View
        style={[
          styles.messageContent,
          item.isUser ? styles.userContent : styles.botContent,
        ]}
      >
        {item.isTyping ? (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text
              style={{
                fontStyle: "italic",
                color: "#999",
                marginRight: 8,
              }}
            >
              Sedang berpikir...
            </Text>
            <LottieView
              source={require("../../assets/images/typing.json")}
              autoPlay
              loop
              style={{ width: 30, height: 30 }}
            />
          </View>
        ) : (
          <Text style={item.isUser ? styles.userText : styles.botText}>
            {item.text}
          </Text>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Image
            source={require("../../assets/images/cakji.png")}
            style={styles.avatar}
          />
        </View>
        <Text style={styles.headerText}>Tanya JSC</Text>
      </View>
      {/* CHAT AREA */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 60} // ganti 60 sesuai tinggi bottom bar/tab bar kamu
      >
        <View style={{ flex: 1 }}>
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            style={styles.messageList}
            contentContainerStyle={{
              ...styles.messageListContent,
              paddingBottom: 100, // tambahkan padding bawah agar chat terakhir tidak ketutup input
            }}
            keyboardShouldPersistTaps="handled"
            removeClippedSubviews={false}
          />
          <View style={styles.inputWrapper}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={inputText}
                onChangeText={setInputText}
                placeholder="Ketik pesan..."
                placeholderTextColor="#999"
                multiline
                maxHeight={100}
                onFocus={() => {
                  setTimeout(() => {
                    if (flatListRef.current) {
                      flatListRef.current.scrollToOffset({
                        offset: 0,
                        animated: true,
                      });
                    }
                  }, 100);
                }}
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  (inputText.trim() === "" || isLoading) &&
                    styles.sendButtonDisabled,
                ]}
                onPress={sendMessage}
                disabled={inputText.trim() === "" || isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Ionicons name="send" size={20} color="white" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatAI;
