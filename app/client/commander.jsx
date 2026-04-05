import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function Commander() {
  const router = useRouter();

  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

 const envoyerCommande = async () => {
  if (!description.trim()) {
    Alert.alert("Erreur", "Veuillez saisir votre commande.");
    return;
  }

  setLoading(true);

  try {
    // 🔹 Récupération du token et userId
    const token = await AsyncStorage.getItem("token");
    const userId = await AsyncStorage.getItem("userId");

    if (!token || !userId) {
      router.replace("/login");
      return;
    }

    // 🔹 1. Récupérer l'utilisateur
    const userResponse = await fetch(
      `http://localhost:8082/api/clients/${userId}`
      // {
      //   headers: {
      //     Authorization: `Bearer ${token}`,
      //   },
      // }
    );

    if (!userResponse.ok) {
      throw new Error("Impossible de récupérer le profil utilisateur");
    }

    const user = await userResponse.json();

    // ❗ Vérifier que l'adresse existe
    if (!user.adresse) {
      Alert.alert(
        "Adresse manquante",
        "Veuillez ajouter une adresse de livraison avant de commander.",
        [
          {
            text: "Aller aux paramètres",
            onPress: () => router.push("/client/parametres"),
          },
          { text: "Annuler", style: "cancel" },
        ]
      );
      return;
    }

    // 🔹 2. Envoyer la commande
    const response = await fetch(
      "http://localhost:8082/api/commandes/commandes",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // "Authorization": `Bearer ${token}`, // si vous utilisez JWT
        },
        body: JSON.stringify({
          description,
          adresse: user.adresse,
          username: user.login,
        }),
      }
    );

    if (!response.ok) {
      const msg = await response.text();
      throw new Error(msg || "Erreur lors de l'envoi");
    }

    // 🔹 Récupérer la commande créée
    const commandeCreee = await response.json();

    // 🔹 Réinitialiser le formulaire
    setDescription("");

    // 🔹 Rediriger vers la page détails avec la commande
    router.push({
      pathname: "/commandes/details",
  params: { id: commandeCreee.id },
    });

  } catch (error) {
    Alert.alert("Erreur", error.message);
  } finally {
    setLoading(false);
  }
};


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nouvelle commande</Text>

      <TextInput
        placeholder="Votre commande"
        placeholderTextColor="#94a3b8"
        style={styles.input}
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <TouchableOpacity
        style={styles.button}
        onPress={envoyerCommande}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Envoyer</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
    padding: 20,
    justifyContent: "center",
  },
  title: {
    color: "#f8fafc",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#475569",
    borderRadius: 12,
    padding: 14,
    marginBottom: 15,
    color: "#f1f5f9",
    backgroundColor: "rgba(51,65,85,0.5)",
  },
  button: {
    backgroundColor: "#2563eb",
    padding: 15,
    borderRadius: 12,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    textAlign: "center",
    fontSize: 16,
  },
});
