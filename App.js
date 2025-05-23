import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "./screens/Homepage/HomeScreen";
import ProfilDinsosScreen from "./screens/profil/profil";

const Tab = createBottomTabNavigator();

export default function App() {
    return (
        <NavigationContainer>
            <Tab.Navigator>
                <Tab.Screen name="Home" component={HomeScreen} />
                <Tab.Screen name="Profile" component={ProfilDinsosScreen} />
            </Tab.Navigator>
        </NavigationContainer>
    );
}
