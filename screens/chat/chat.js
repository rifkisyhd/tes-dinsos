import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Keyboard,
  ActivityIndicator,
  Image,
  SafeAreaView,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "./styles";
import OpenAI from "openai";
import Constants from "expo-constants";
import LottieView from "lottie-react-native";
import StyledDescription from '../components/StyledDescription';

// Import data dari file JSON
import DINSOS_DATA from "./dataupt.json";

// Konfigurasi OpenAI
const apiKey =
  Constants.expoConfig?.extra?.EXPO_PUBLIC_OPENAI_API_KEY ||
  process.env.EXPO_PUBLIC_OPENAI_API_KEY;
const openai = new OpenAI({ apiKey });

// Sistem prompt dasar (ringkas)
const BASE_SYSTEM_PROMPT = `
Anda adalah Cak J, asisten virtual Dinas Sosial Provinsi Jawa Timur.
jawab pertanyaan masyarakat dengan informasi layanan sosial.
Gunakan bahasa yang ramah, sopan, dan mudah dipahami.
Jika tidak tahu informasi spesifik, arahkan untuk menghubungi kantor pusat di (031) 8292013.
Jawab dalam Bahasa Indonesia dengan gaya santun tapi tidak kaku.
`;

const ChatAI = () => {
  const [messages, setMessages] = useState([
    {
      id: "1",
      text: "Halo! Saya Cak J, asisten Dinas Sosial Jawa Timur. Ada yang bisa saya bantu?",
      isUser: false,
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef(null);

  // Auto scroll ke bawah
  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // Keyboard handling
  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", () => {
      if (flatListRef.current && messages.length > 0) {
        setTimeout(() => {
          flatListRef.current.scrollToEnd({ animated: true });
        }, 300);
      }
    });
    return () => showSub.remove();
  }, [messages]);

  const extractKeywords = (query) => {
    const lowerQuery = query.toLowerCase();
    const stopWords = [
      'apa', 'bagaimana', 'dimana', 'siapa', 'kapan', 'yang', 'dan', 'atau', 
      'di', 'ke', 'dari', 'untuk', 'dengan', 'adalah', 'ada', 'saya', 'bisa', 
      'mau', 'ingin', 'tentang', 'info', 'informasi', 'cari', 'butuh', 'perlu',
      'tolong', 'bantu', 'please', 'daftar', 'list'
    ];
    
    return lowerQuery
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.includes(word))
      .map(word => word.replace(/[^\w\s-]/g, '').trim())
      .filter(word => word.length > 0);
  };

  const categorizeQuery = (query) => {
    const lowerQuery = query.toLowerCase();
    
    // Pola kata kunci yang lebih spesifik dan komprehensif
    const categoryPatterns = {
      asuhan_anak: [
        'balita', 'anak', 'bayi', 'panti asuhan', 'asuhan anak', 'yatim', 'piatu', 
        'yatim piatu', 'adopsi', 'tumbuh kembang', 'anak terlantar', 'asuhan balita',
        'panti anak', 'rumah anak', 'anak jalanan', 'anak putus sekolah'
      ],
      lansia: [
        'lansia', 'jompo', 'manula', 'orang tua', 'werdha', 'lanjut usia', 
        'panti werdha', 'perawatan lansia', 'nenek', 'kakek', 'pension'
      ],
      disabilitas: [
        'disabilitas', 'cacat', 'tuna', 'netra', 'rungu', 'daksa', 'grahita', 
        'rehabilitasi sosial', 'difabel', 'berkebutuhan khusus', 'kursi roda',
        'buta', 'tuli', 'lumpuh', 'autis', 'down syndrome'
      ],
      remaja_abh: [
        'remaja', 'ABH', 'anak berhadapan hukum', 'kenakalan', 'delinkuen', 
        'marsudi putra', 'narapidana anak', 'tahanan anak', 'juvenile'
      ],
      perempuan: [
        'perempuan', 'wanita', 'ibu', 'KDRT', 'kekerasan', 'trafficking', 
        'perdagangan orang', 'korban kekerasan', 'shelter', 'rumah aman'
      ],
      gelandangan: [
        'gelandangan', 'pengemis', 'gepeng', 'tuna sosial', 'homeless', 
        'pengamen', 'pemulung', 'anak jalanan'
      ],
      narkoba: [
        'narkoba', 'napza', 'rehabilitasi', 'ketergantungan', 'pecandu', 
        'drug', 'addict', 'detox', 'detoksifikasi'
      ],
      program_bantuan: [
        'bantuan', 'pkh', 'bpnt', 'pip', 'bst', 'dana', 'uang', 'sembako', 
        'bantuan sosial', 'program keluarga harapan', 'bantuan pangan',
        'kartu', 'KKS', 'subsidi', 'stimulus'
      ],
      kontak_info: [
        'alamat', 'telepon', 'kontak', 'kantor', 'email', 'lokasi', 'dimana',
        'nomor', 'hp', 'whatsapp', 'wa', 'hubungi'
      ],
      jam_operasional: [
        'jam', 'buka', 'tutup', 'operasional', 'kerja', 'libur', 'waktu',
        'hari', 'senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu', 'minggu'
      ],
      kepemimpinan: [
        'kepala', 'kadis', 'pimpinan', 'direktur', 'pejabat', 'ketua', 'manager'
      ],
      sosmed: [
        'sosial media', 'facebook', 'instagram', 'twitter', 'whatsapp', 'wa',
        'fb', 'ig', 'medsos', 'social media'
      ]
    };

    // Cari kategori yang paling cocok
    let bestCategory = 'general';
    let maxMatches = 0;

    for (const [category, patterns] of Object.entries(categoryPatterns)) {
      const matches = patterns.filter(pattern => lowerQuery.includes(pattern)).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        bestCategory = category;
      }
    }

    return bestCategory;
  };

  // Sistem scoring yang lebih akurat
  const calculateUPTScore = (upt, keywords, category) => {
    let score = 0;
    const uptText = `${upt.nama} ${upt.layanan} ${upt.kategori} ${upt.alamat}`.toLowerCase();
    
    // Bonus kategori yang lebih spesifik
    const categoryBonus = {
      asuhan_anak: upt.kategori?.includes('asuhan_anak') || upt.kategori?.includes('anak') ? 100 : 0,
      lansia: upt.kategori?.includes('lansia') || upt.kategori?.includes('werdha') ? 100 : 0,
      disabilitas: upt.kategori?.includes('disabilitas') || upt.kategori?.includes('rehabilitasi') ? 100 : 0,
      remaja_abh: upt.kategori?.includes('remaja') || upt.kategori?.includes('ABH') ? 100 : 0,
      perempuan: upt.kategori?.includes('perempuan') || upt.kategori?.includes('wanita') ? 100 : 0,
      gelandangan: upt.kategori?.includes('gelandangan') || upt.kategori?.includes('gepeng') ? 100 : 0,
      narkoba: upt.kategori?.includes('narkoba') || upt.kategori?.includes('napza') ? 100 : 0,
    };
    
    score += categoryBonus[category] || 0;

    // Scoring berdasarkan keyword match dengan bobot yang berbeda
    keywords.forEach(keyword => {
      // Prioritas tertinggi: nama UPT
      if (upt.nama.toLowerCase().includes(keyword)) {
        score += 50;
      }
      // Prioritas tinggi: layanan
      if (upt.layanan.toLowerCase().includes(keyword)) {
        score += 40;
      }
      // Prioritas sedang: kategori
      if (upt.kategori?.toLowerCase().includes(keyword)) {
        score += 30;
      }
      // Prioritas rendah: alamat
      if (upt.alamat.toLowerCase().includes(keyword)) {
        score += 10;
      }
    });

    // Bonus untuk exact match
    const queryLower = keywords.join(' ');
    if (upt.nama.toLowerCase().includes(queryLower)) {
      score += 75;
    }

    return score;
  };

  const getRelevantUPTs = (keywords, category) => {
    const upts = DINSOS_DATA.upt_list || [];
    if (!upts.length) return [];

    console.log(`DEBUG: Total UPTs available: ${upts.length}`);
    console.log(`DEBUG: Category: ${category}, Keywords: [${keywords.join(', ')}]`);

    // Jika kategori spesifik, filter berdasarkan kategori terlebih dahulu
    let filteredUpts = upts;
    
    if (category !== 'general' && category !== 'kontak_info' && category !== 'jam_operasional') {
      filteredUpts = upts.filter(upt => {
        const kategoriUpt = upt.kategori?.toLowerCase() || '';
        
        switch(category) {
          case 'asuhan_anak':
            return kategoriUpt.includes('asuhan_anak') || kategoriUpt.includes('anak') || 
                   kategoriUpt.includes('balita');
          case 'lansia':
            return kategoriUpt.includes('lansia') || kategoriUpt.includes('werdha');
          case 'disabilitas':
            return kategoriUpt.includes('disabilitas') || kategoriUpt.includes('rehabilitasi');
          case 'remaja_abh':
            return kategoriUpt.includes('remaja') || kategoriUpt.includes('abh');
          case 'perempuan':
            return kategoriUpt.includes('perempuan') || kategoriUpt.includes('wanita');
          case 'gelandangan':
            return kategoriUpt.includes('gelandangan') || kategoriUpt.includes('gepeng');
          case 'narkoba':
            return kategoriUpt.includes('narkoba') || kategoriUpt.includes('napza');
          default:
            return true;
        }
      });
    }

    console.log(`DEBUG: Filtered UPTs: ${filteredUpts.length}`);

    // Jika masih terlalu banyak atau tidak ada hasil, gunakan scoring
    if (filteredUpts.length === 0) {
      filteredUpts = upts; // Fallback ke semua UPT
    }

    // Hitung score untuk setiap UPT
    const scoredUpts = filteredUpts.map(upt => ({
      ...upt,
      score: calculateUPTScore(upt, keywords, category)
    }));

    // Urutkan berdasarkan score dan ambil yang relevan
    const relevantUpts = scoredUpts
      .sort((a, b) => b.score - a.score)
      .filter(upt => upt.score > 0);

    console.log(`DEBUG: Relevant UPTs found: ${relevantUpts.length}`);
    
    // Ambil maksimal 5 UPT terbaik untuk menghindari token berlebihan
    const topUpts = relevantUpts.slice(0, 5);
    
    console.log(`DEBUG: Top UPTs selected: ${topUpts.length}`);
    topUpts.forEach((upt, index) => {
      console.log(`${index + 1}. ${upt.nama} (Score: ${upt.score})`);
    });

    return topUpts;
  };

  // Format UPT dengan informasi esensial saja
  const formatUPTs = (upts, title) => {
    if (!upts || upts.length === 0) return "";
    
    let result = `=== ${title} ===\n\n`;
    upts.forEach((upt, index) => {
      result += `${index + 1}. ${upt.nama}\n`;
      result += `   Alamat: ${upt.alamat}\n`;
      result += `   Telepon: ${upt.telepon}\n`;
      result += `   Layanan: ${upt.layanan}\n`;
      if (upt.kategori) result += `   Kategori: ${upt.kategori}\n`;
      if (upt.biaya) result += `   Biaya: ${upt.biaya}\n`;
      if (upt.daya_tampung) result += `   Kapasitas: ${upt.daya_tampung} orang\n`;
      result += '\n';
    });
    return result;
  };

  const getKantorPusatData = () => {
    const kantor = DINSOS_DATA.kantor_pusat;
    if (!kantor) return "";
    
    let result = `=== KANTOR PUSAT DINAS SOSIAL JATIM ===\n`;
    result += `Nama: ${kantor.nama}\n`;
    result += `Alamat: ${kantor.alamat}\n`;
    result += `Telepon: ${kantor.telepon}\n`;
    if (kantor.email) result += `Email: ${kantor.email}\n`;
    if (kantor.website) result += `Website: ${kantor.website}\n`;
    if (kantor.kepala_dinas) result += `Kepala Dinas: ${kantor.kepala_dinas}\n`;
    
    if (kantor.jam_operasional) {
      result += `Jam Operasional:\n`;
      result += `- Senin-Kamis: ${kantor.jam_operasional.senin_kamis}\n`;
      result += `- Jumat: ${kantor.jam_operasional.jumat}\n`;
      result += `- Sabtu-Minggu: ${kantor.jam_operasional.sabtu_minggu}\n`;
    }
    
    return result;
  };

  const getProgramBantuan = (keywords) => {
    const programs = DINSOS_DATA.kantor_pusat?.program || [];
    if (!programs.length) return "";
    
    // Filter program yang relevan berdasarkan keywords
    let relevantPrograms = programs;
    
    if (keywords.length > 0) {
      relevantPrograms = programs.filter(program => {
        const programText = `${program.nama} ${program.deskripsi} ${program.kategori}`.toLowerCase();
        return keywords.some(keyword => programText.includes(keyword));
      });
    }
    
    // Jika tidak ada yang cocok, ambil semua program
    if (relevantPrograms.length === 0) {
      relevantPrograms = programs;
    }
    
    let result = `PROGRAM BANTUAN SOSIAL\n\n`;
    relevantPrograms.forEach((program, index) => {
      result += `${index + 1}. ${program.nama}\n`;
      result += `   Deskripsi: ${program.deskripsi}\n`;
      if (program.target_penerima) result += `   Target: ${program.target_penerima}\n`;
      if (program.besaran_bantuan) {
        result += `   Besaran: `;
        if (typeof program.besaran_bantuan === 'string') {
          result += `${program.besaran_bantuan}\n`;
        } else {
          result += `${Object.values(program.besaran_bantuan).join(', ')}\n`;
        }
      }
      if (program.kontak) result += `   Kontak: ${program.kontak}\n`;
      result += '\n';
    });
    
    return result;
  };

  const getRelevantData = (query) => {
    const keywords = extractKeywords(query);
    const category = categorizeQuery(query);

    console.log(`DEBUG: Query: "${query}"`);
    console.log(`DEBUG: Keywords: [${keywords.join(', ')}]`);
    console.log(`DEBUG: Category: ${category}`);
    
    let contextParts = [];

    // Berdasarkan kategori, ambil data yang relevan
    switch(category) {
      case 'program_bantuan':
        contextParts.push(getProgramBantuan(keywords));
        contextParts.push(getKantorPusatData());
        break;
        
      case 'kontak_info':
      case 'jam_operasional':
      case 'kepemimpinan':
      case 'sosmed':
        contextParts.push(getKantorPusatData());
        break;
        
      default:
        // Untuk kategori UPT atau general
        const relevantUpts = getRelevantUPTs(keywords, category);
        
        if (relevantUpts.length > 0) {
          contextParts.push(formatUPTs(relevantUpts, "UPT YANG RELEVAN"));
        } else {
          // Jika tidak ada UPT yang cocok, berikan info umum
          contextParts.push(getKantorPusatData());
        }
        break;
    }

    // Selalu tambahkan kontak kantor pusat sebagai fallback
    if (category !== 'kontak_info' && category !== 'jam_operasional') {
      const kantorInfo = getKantorPusatData();
      if (!contextParts.some(part => part.includes("KANTOR PUSAT"))) {
        contextParts.push("\n" + kantorInfo);
      }
    }

    const finalContext = contextParts.join("\n" + "=".repeat(50) + "\n");
    console.log(`DEBUG: Final context length: ${finalContext.length} characters`);
    
    return finalContext;
  };

  const sendMessage = async () => {
    if (inputText.trim() === "") return;
    
    const userMessage = { 
      id: Date.now().toString(), 
      text: inputText, 
      isUser: true 
    };
    
    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputText;
    setInputText("");
    setIsLoading(true);

    const typingMessage = { 
      id: "typing-indicator", 
      text: "Sedang mencari informasi...", 
      isUser: false, 
      isTyping: true 
    };
    
    setMessages(prev => [...prev, typingMessage]);

    try {
      if (!apiKey) {
        throw new Error("API key tidak tersedia");
      }

      // Dapatkan konteks yang relevan
      const dataContext = getRelevantData(currentInput);
      
      // Buat system prompt yang optimized
      const systemPrompt = `${BASE_SYSTEM_PROMPT}

      DATA YANG TERSEDIA:
      ${dataContext}`

      const response = await openai.chat.completions.create({
        model: "gpt-4.1",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: currentInput }
        ],
        temperature: 0.1,
        max_tokens: 1000,
      });

      const botResponse = { 
        id: Date.now().toString() + "-bot", 
        text: response.choices[0].message.content, 
        isUser: false 
      };
      
      setMessages(prev => [
        ...prev.filter(msg => msg.id !== "typing-indicator"), 
        botResponse
      ]);

    } catch (error) {
      console.error("Error sending message:", error);
      
      const kantorPusat = DINSOS_DATA.kantor_pusat;
      const errorMessage = { 
        id: Date.now().toString() + "-error", 
        text: `Maaf, terjadi kendala teknis. Silakan coba beberapa saat lagi atau hubungi langsung ke ${kantorPusat?.telepon || '(031) 8290794'} untuk bantuan.`, 
        isUser: false, 
        isError: true 
      };
      
      setMessages(prev => [
        ...prev.filter(msg => msg.id !== "typing-indicator"), 
        errorMessage
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={[
      styles.messageBubble, 
      item.isUser ? styles.userBubble : styles.botBubble,
      item.isError && styles.errorBubble
    ]}>
      {!item.isUser && (
        <View style={styles.avatarContainer}>
          <Image 
            source={require("../../assets/images/cakji.png")} 
            style={styles.avatar} 
          />
        </View>
      )}
      <View style={[
        styles.messageContent, 
        item.isUser ? styles.userContent : styles.botContent
      ]}>
        {item.isTyping ? (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={{ fontStyle: "italic", color: "#999", marginRight: 8 }}>
              {item.text}
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
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Image 
            source={require("../../assets/images/cakji.png")} 
            style={styles.avatar} 
          />
        </View>
        <Text style={styles.headerText}>Tanya JSC</Text>
      </View>
      
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 50}
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
              paddingBottom: 110 
            }}
            keyboardShouldPersistTaps="handled"
          />
          
          <View style={styles.inputWrapper}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={inputText}
                onChangeText={setInputText}
                placeholder="Tanya tentang layanan Dinsos Jatim..."
                placeholderTextColor="#999"
                multiline
              />
              <TouchableOpacity 
                style={[
                  styles.sendButton, 
                  (inputText.trim() === "" || isLoading) && styles.sendButtonDisabled
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