import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import ClientHeader from "../../components/ClientHeader";

export default function ClientHome() {
  const router = useRouter();
  const clientName = "Kenza";

  return (
    <View style={styles.container}>
      <ClientHeader username={clientName} />

      <View style={styles.card}>
        <Text style={styles.title}>Espace Client</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/client/commander")}
        >
          <Text style={styles.buttonText}>🛒 Passer une commande</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/client/mes-commandes")}
        >
          <Text style={styles.buttonText}>📦 Mes commandes</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buttonSecondary}
          onPress={() => router.push("/client/parametres")}
        >
          <Text style={styles.buttonText}>⚙️ Paramétrage</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
  },
  card: {
    margin: 20,
    padding: 25,
    borderRadius: 20,
    backgroundColor: "rgba(30,41,59,0.9)",
  },
  title: {
    color: "#f8fafc",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#2563eb",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
  },
  buttonSecondary: {
    backgroundColor: "#334155",
    padding: 15,
    borderRadius: 12,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16,
  },
});
