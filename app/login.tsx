import React, { useState, useLayoutEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { useNavigation } from "@react-navigation/native";
import AwesomeAlert from "react-native-awesome-alerts";

export default function LoginScreen() {
  const router = useRouter();
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const [login, setLogin] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  const handleLogin = async () => {
    if (!login || !motDePasse) {
      setAlertTitle("Champs requis");
      setAlertMessage("Veuillez entrer votre login et mot de passe.");
      setShowAlert(true);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:8082/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, motDePasse }),
      });

      if (response.ok) {
        setAlertTitle("Succès");
        setAlertMessage("Connexion réussie !");
      } else if(response.status==401){
        debugger
          setAlertTitle("Erreur");
        setAlertMessage("l'utilisateur n'est pas encore valider par l'admin.");
      }
      else{
        setAlertTitle("Erreur");
        setAlertMessage("Login ou mot de passe incorrect.");
      }
    } catch (err) {
      setAlertTitle("Erreur serveur");
      setAlertMessage("Impossible de contacter le serveur.");
    } finally {
      setLoading(false);
      setShowAlert(true);
    }
  };

  return (
    <ImageBackground
      source={{
        uri: "https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80&w=2070",
      }}
      style={styles.bg}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <Text style={styles.title}>Se connecter</Text>

            <TextInput
              style={styles.input}
              placeholder="Login"
              placeholderTextColor="#cbd5e1"
              value={login}
              onChangeText={setLogin}
              autoCapitalize="none"
            />

            <TextInput
              style={styles.input}
              placeholder="Mot de passe"
              placeholderTextColor="#cbd5e1"
              value={motDePasse}
              onChangeText={setMotDePasse}
              secureTextEntry
            />

            <TouchableOpacity
              style={styles.submit}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitText}>Connexion</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/signup")}
              style={{ marginTop: 15 }}
            >
              <Text style={styles.linkText}>
                Pas encore de compte ? <Text style={{ color: "#60a5fa" }}>Inscrivez-vous</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <AwesomeAlert
        show={showAlert}
        title={alertTitle}
        message={alertMessage}
        showConfirmButton
        confirmText="OK"
        confirmButtonColor="#2563eb"
        onConfirmPressed={() => {
          setShowAlert(false);
          if (alertTitle === "Succès") router.push("/dashboard");
        }}
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    justifyContent: "center",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  card: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "rgba(30,41,59,0.9)",
    padding: 25,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#f8fafc",
    textAlign: "center",
    marginBottom: 25,
  },
  input: {
    borderWidth: 1,
    borderColor: "#475569",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    color: "#f1f5f9",
    backgroundColor: "rgba(51,65,85,0.5)",
  },
  submit: {
    backgroundColor: "#2563eb",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  submitText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  linkText: { color: "#cbd5e1", textAlign: "center", marginTop: 10 },
});
