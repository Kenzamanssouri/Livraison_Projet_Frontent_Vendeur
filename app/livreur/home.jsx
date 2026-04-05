import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const BASE_URL = "http://localhost:8082"; 
// ⚠️ IMPORTANT : Mets ici l'IP de ton PC si tu testes sur téléphone

export default function LivreurHome() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [commandes, setCommandes] = useState([]);
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    initLoad();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, [])
  );

  const initLoad = async () => {
    setLoading(true);
    await Promise.all([loadCommandes(), loadNotifications()]);
    setLoading(false);
  };

  /* ==========================
     🔹 LOAD COMMANDES
  ========================== */
  const loadCommandes = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const livreurId = await AsyncStorage.getItem("userId");

      if (!token || !livreurId) {
        router.replace("/login");
        return;
      }

      const res = await fetch(
        `${BASE_URL}/api/commandes/livreur/commandes?livreurId=${livreurId}`
      );

      if (!res.ok) {
        console.log("Erreur API commandes:", res.status);
        setCommandes([]);
        return;
      }

      const data = await res.json();debugger
      setCommandes(data);
    } catch (e) {
      console.log("Erreur chargement commandes", e);
      setCommandes([]);
    }
  };

/* ==========================
   🔔 LOAD NOTIFICATION COUNT
========================== */
const loadNotifications = async () => {
  try {
    const res = await fetch(
      `${BASE_URL}/api/notification/livreur/unread/count`
    );

    if (!res.ok) {
      console.log("Erreur API notif count:", res.status);
      setNotifCount(0);
      return;
    }

    const count = await res.json();
    setNotifCount(count);
  } catch (e) {
    console.log("Erreur chargement notif count", e);
    setNotifCount(0);
  }
};

  const logout = async () => {
    await AsyncStorage.clear();
    router.replace("/login");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 🔹 HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🚚 Livreur</Text>

        <View style={styles.headerActions}>
          {/* 🔔 NOTIFICATIONS */}
          <TouchableOpacity
            style={styles.notifBtn}
            onPress={() => router.push("/livreur/notifications")}
          >
            <Ionicons name="notifications-outline" size={22} color="#60a5fa" />

            {notifCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{notifCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* ⎋ LOGOUT */}
          <TouchableOpacity onPress={logout} style={styles.headerBtn}>
            <Ionicons name="log-out-outline" size={22} color="#60a5fa" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 🔹 CONTENT */}
      <ScrollView contentContainerStyle={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color="#2563eb" />
        ) : commandes.length === 0 ? (
          <Text style={styles.empty}>Aucune commande à livrer</Text>
        ) : (
          commandes.map((cmd) => (
            <View key={cmd.id} style={styles.card}>
              <Text style={styles.cardTitle}>Commande #{cmd.id}</Text>

              <Text style={styles.text}>
                📍 Adresse : {cmd.livraisonAdresse}
              </Text>

              <Text style={styles.text}>
                📦 Statut : {cmd.statut}
              </Text>

              <TouchableOpacity
                style={styles.btn}
                onPress={() =>
                  router.push(`/livreur/commande/${cmd.id}`)
                }
              >
                <Text style={styles.btnText}>Voir détails</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/* ==========================
   🎨 STYLES
========================== */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#020617",
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#f8fafc",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  notifBtn: {
    marginRight: 12,
    padding: 8,
  },
  badge: {
    position: "absolute",
    top: 2,
    right: 2,
    backgroundColor: "#ef4444",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  headerBtn: {
    backgroundColor: "#1e293b",
    padding: 10,
    borderRadius: 10,
  },
  content: {
    padding: 20,
  },
  empty: {
    color: "#cbd5e1",
    textAlign: "center",
    marginTop: 50,
  },
  card: {
    backgroundColor: "#1e293b",
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
  },
  cardTitle: {
    color: "#f1f5f9",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  text: {
    color: "#cbd5e1",
    marginBottom: 5,
  },
  btn: {
    marginTop: 10,
    backgroundColor: "#2563eb",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  btnText: {
    color: "#fff",
    fontWeight: "bold",
  },
});