import React, { useEffect } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import TabNavigator from "./screens/TabNavigator.js";
// import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import HomeScreen from "./screens/Homepage/HomeScreen";
import ProfilDinsosScreen from "./screens/profil/profil";
import ContactScreen from "./screens/kontak/kontak";
import AplicationList from "./screens/aplikasi/aplikasi";
import InnovationScreen from "./screens/inovasi/inovasi";
import ProgramScreen from "./screens/program/program";
import ProgramDetailScreen from "./screens/program-detail/ProgramDetail";
import LayananScreen from "./screens/layanan/layanan";
import DetailLayananScreen from "./screens/layanan-detail/LayananDetail";
import PerizinanScreen from "./screens/perizinan/perizinan";
import DetailPerizinanScreen from "./screens/perizinan-detail/PerizinanDetail";
import BidangScreen from "./screens/bidang/BidangDetail";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="MainTabs" component={TabNavigator} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Kontak" component={ContactScreen} />
        <Stack.Screen name="Aplikasi" component={AplicationList} />
        <Stack.Screen name="Inovasi" component={InnovationScreen} />
        <Stack.Screen name="Program" component={ProgramScreen} />

        

      </Stack.Navigator>
    </NavigationContainer>
  );
}
