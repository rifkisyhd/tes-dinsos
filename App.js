import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import TabNavigator from "./screens/TabNavigator";

import BidangScreen from "./screens/bidang/BidangDetail";
import AplicationList from "./screens/aplikasi/aplikasi";
import ProgramDetailScreen from "./screens/program-detail/ProgramDetail";
import ProgramScreen from "./screens/program/program";
import InnovationScreen from "./screens/inovasi/inovasi";
import LayananScreen from "./screens/layanan/layanan";
import DetailLayananScreen from "./screens/layanan-detail/LayananDetail";
import PengaduanScreen from "./screens/pengaduan/pengaduan";
import ContactScreen from "./screens/kontak/kontak";
import HomeScreen from "./screens/Homepage/HomeScreen";

const Stack = createNativeStackNavigator();

export default function App() {
    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false, // HEADER DIHILANGKAN GLOBAL
                }}>
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="Bidang" component={BidangScreen} />
                <Stack.Screen name="Aplikasi" component={AplicationList} />
                <Stack.Screen
                    name="Detail-Program"
                    component={ProgramDetailScreen}
                />
                <Stack.Screen name="Program" component={ProgramScreen} />
                <Stack.Screen name="Inovasi" component={InnovationScreen} />
                <Stack.Screen name="Layanan" component={LayananScreen} />
                <Stack.Screen
                    name="Detail-Layanan"
                    component={DetailLayananScreen}
                />
                <Stack.Screen name="Pengaduan" component={PengaduanScreen} />
                <Stack.Screen name="Kontak" component={ContactScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
