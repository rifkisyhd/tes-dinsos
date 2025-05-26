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
import UptScreen from "./screens/upt/upt";
import UptDetail from "./screens/upt-detail/UptDetail";
import PengaduanScreen from "./screens/pengaduan/pengaduan";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs" component={TabNavigator} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Kontak" component={ContactScreen} />
        <Stack.Screen name="Aplikasi" component={AplicationList} />
        <Stack.Screen name="Inovasi" component={InnovationScreen} />
        <Stack.Screen name="Program" component={ProgramScreen} />
        <Stack.Screen name="Detail-Program" component={ProgramDetailScreen} />
        <Stack.Screen name="Layanan" component={LayananScreen} />
        <Stack.Screen name="Detail-Layanan" component={DetailLayananScreen} />
        <Stack.Screen name="Perizinan" component={PerizinanScreen} />
        <Stack.Screen name="Detail-Perizinan" component={DetailPerizinanScreen} />
        <Stack.Screen name="Bidang" component={BidangScreen} />

        <Stack.Screen name="Upt" component={UptScreen} />
        <Stack.Screen name="Detail-Upt" component={UptDetail} />
        <Stack.Screen name="Pengaduan" component={PengaduanScreen} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}
