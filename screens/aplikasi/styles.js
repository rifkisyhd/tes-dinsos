import { StyleSheet, Platform, StatusBar } from "react-native";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#33A9FF",
    },
    content: {
        flex: 1,
        padding: 16,
        backgroundColor: "#f5f5f5",
    },

    gridContainer: {
        paddingHorizontal: 24,
    },
    card: {
        backgroundColor: "white",
        borderRadius: 15,
        padding: 15,
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 5,
        elevation: 5, // Untuk shadow di Android
        width: "100%", // Sesuaikan ukuran card
        alignSelf: "center",
        marginVertical: 10,
    },
    cardContent: {
        flexDirection: "row", // Biar gambar & teks sejajar
        alignItems: "center",
        justifyContent: "space-between",
    },
    cardTextContainer: {
        flex: 1, // Biar teks memenuhi space dengan baik
        paddingRight: 10, // Jarak antara teks & gambar
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "black",
    },
    cardSubtitle: {
        fontSize: 16,
        color: "black",
    },
   cardImage: {
    width: "100%",        
    aspectRatio: 1,    
    maxWidth: 150,       
    alignSelf: "center", 
    resizeMode: "contain",
},
    homeIndicator: Platform.select({
        ios: {
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 34,
            backgroundColor: "#f5f5f5",
        },
        android: {}, // Di Android nggak ada style
    }),
});
