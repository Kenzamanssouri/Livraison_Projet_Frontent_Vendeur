import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useLocalSearchParams } from "expo-router";

const BASE_URL = "http://localhost:8082";

export default function CommandeDetail() {
  const { id } = useLocalSearchParams();
  const [commande, setCommande] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCommande();
  }, []);

  const loadCommande = async () => {
    try {
      const res = await fetch(
        `${BASE_URL}/api/commande/${id}`
      );

      const data = await res.json();
      setCommande(data);
    } catch (e) {
      console.log("Erreur detail commande", e);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!commande) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "white" }}>
          Commande introuvable
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>
        Commande #{commande.id}
      </Text>

      <Text style={styles.label}>Client :</Text>
      <Text style={styles.value}>{commande.clientNom}</Text>

      <Text style={styles.label}>Adresse :</Text>
      <Text style={styles.value}>{commande.adresse}</Text>

      <Text style={styles.label}>Statut :</Text>
      <Text style={styles.value}>{commande.statut}</Text>

      <Text style={styles.label}>Montant :</Text>
      <Text style={styles.value}>
        {commande.total} MAD
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    padding: 20,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0f172a",
  },
  title: {
    color: "#f8fafc",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  label: {
    color: "#94a3b8",
    marginTop: 15,
  },
  value: {
    color: "#f8fafc",
    fontSize: 16,
    marginTop: 5,
  },
});