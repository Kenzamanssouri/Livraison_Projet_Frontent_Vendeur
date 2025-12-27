import AsyncStorage from "@react-native-async-storage/async-storage";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { useRouter } from "expo-router";
import React, { useContext } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

// Contexte langue (optionnel)
import { LanguageContext } from "../../context/LanguageContext";

// Tes pages vendeur
import ProduitsScreen from "./produits";
import CommandesScreen from "./commandes";
import HistoriqueScreen from "./historique";
import PaiementScreen from "./paiement";
import ParametreScreen from "./parametres";
import DashboardVendeur from "./index";

const Drawer = createDrawerNavigator();

export default function VendeurLayout() {
  const router = useRouter();
  const { lang, t } =
    useContext(LanguageContext) || { lang: "fr", t: (k: string) => k };

  // 🔥 Déconnexion
  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("role");
    await AsyncStorage.removeItem("userId");
    router.replace("/login");
  };

  return (
    <Drawer.Navigator
      // ⚠️ DOIT MATCHER LE name DU SCREEN CI-DESSOUS
      initialRouteName="dashboard"
      screenOptions={{
        headerStyle: { backgroundColor: "#1e40af" },
        headerTintColor: "#fff",
        drawerActiveBackgroundColor: "#1e3a8a",
        drawerActiveTintColor: "#fff",
        drawerInactiveTintColor: "#cbd5e1",
        drawerLabelStyle: { fontSize: 16 },
        headerRight: () => (
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={handleLogout} style={{ marginRight: 15 }}>
              <Icon name="logout" size={28} color="#fff" />
            </TouchableOpacity>
          </View>
        ),
      }}
    >
      {/* 🟦 DASHBOARD VENDEUR */}
      <Drawer.Screen
        name="dashboard" // ✅ nom interne, différent de /dashboard-vendeur
        options={{
          title: "Tableau de bord",
          drawerIcon: ({ color, size }) => (
            <Icon name="view-dashboard-outline" color={color} size={size} />
          ),
        }}
      >
        {(props) => <DashboardVendeur {...props} lang={lang} />}
      </Drawer.Screen>

      {/* 🟩 PRODUITS */}
      <Drawer.Screen
        name="Produits"
        options={{
          title: "Produits",
          drawerIcon: ({ color, size }) => (
            <Icon name="store-edit-outline" color={color} size={size} />
          ),
        }}
      >
        {(props) => <ProduitsScreen {...props} />}
      </Drawer.Screen>

      {/* 🟨 COMMANDES */}
      <Drawer.Screen
        name="Commandes"
        options={{
          title: "Commandes",
          drawerIcon: ({ color, size }) => (
            <Icon name="cart-outline" color={color} size={size} />
          ),
        }}
      >
        {(props) => <CommandesScreen {...props} />}
      </Drawer.Screen>

      {/* 🟪 HISTORIQUE */}
      <Drawer.Screen
        name="Historique"
        options={{
          title: "Historique",
          drawerIcon: ({ color, size }) => (
            <Icon name="history" color={color} size={size} />
          ),
        }}
      >
        {(props) => <HistoriqueScreen {...props} />}
      </Drawer.Screen>

      {/* 🟥 PAIEMENT */}
      <Drawer.Screen
        name="Paiement"
        options={{
          title: "Gestion Paiement",
          drawerIcon: ({ color, size }) => (
            <Icon name="credit-card-outline" color={color} size={size} />
          ),
        }}
      >
        {(props) => <PaiementScreen {...props} />}
      </Drawer.Screen>

      {/* 🔧 PARAMETRES */}
      <Drawer.Screen
        name="Parametres"
        options={{
          title: "Paramétrage",
          drawerIcon: ({ color, size }) => (
            <Icon name="cog-outline" color={color} size={size} />
          ),
        }}
      >
        {(props) => <ParametreScreen {...props} />}
      </Drawer.Screen>
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
});
