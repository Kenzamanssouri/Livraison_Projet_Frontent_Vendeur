import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function HistoriqueScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historique</Text>
      <Text style={styles.subtitle}>Historique des commandes & paiements.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  subtitle: { fontSize: 14, color: "#64748b" },
});
