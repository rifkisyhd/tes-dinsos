import "dotenv/config";

export default ({ config }) => ({
  ...config,
    name: "DinsosUhuy",
    slug: "expo-jancok",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/logo_dinsos.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/images/logo_dinsos.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/logo_dinsos.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true,
      package: "com.dinsosuhuy.expojancok"
    },
    web: {
      favicon: "./assets/images/logo_dinsos.png"
    },
    extra: {
      eas: {
        projectId: "3bfe9d77-0612-41ff-9852-40c45bda34c4"
      },
      EXPO_PUBLIC_OPENAI_API_KEY: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
      EXPO_PUBLIC_SUPABASE_URL: process.env.SUPABASE_URL,
      EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
      EXPO_PUBLIC_API_TOKEN: process.env.API_TOKEN
    },
    permissions: ["INTERNET"],
    owner: "kandiuhuy",
     assetBundlePatterns: ["**/*"],
  }
);
