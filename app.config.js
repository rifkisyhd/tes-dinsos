import "dotenv/config";

export default ({ config }) => ({
  ...config,
    name: "SIP JOSS",
    slug: "CatalogDinsos",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/splash-app.jpg",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/images/splash-app.jpg",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/logo-app.jpg",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true,
      package: "com.dinsos.katalog"
    },
    web: {
      favicon: "./assets/images/logo-app.jpg",
    },
    extra: {
      eas: {
        projectId: "0865b149-a20d-4af4-b1d3-26f552de7324"
      },
      EXPO_PUBLIC_OPENAI_API_KEY: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
      EXPO_PUBLIC_SUPABASE_URL: process.env.SUPABASE_URL,
      EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
      EXPO_PUBLIC_API_TOKEN: process.env.API_TOKEN
    },
    permissions: ["INTERNET"],
    owner: "dinassosial",
     assetBundlePatterns: ["**/*"],
  }
);
