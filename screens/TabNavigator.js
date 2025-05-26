import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons, FontAwesome, FontAwesome5 } from "@expo/vector-icons";

import HomeScreen from "./Homepage/HomeScreen";
import ChatAI from "./chat/chat";
import ProfilDinsosScreen from "./profil/profil";
import DataTable from "./sapa-bansos/sapa-bansos";

import BansosIcon from "./components/icons/bansos";

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ChatAI"
        component={ChatAI}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="chatbox-ellipses-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profil"
        component={ProfilDinsosScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="user-o" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="SapaBansos"
        component={DataTable}
        options={{
          tabBarIcon: ({ color, size }) => (
            <BansosIcon width={size} height={size} fill={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
