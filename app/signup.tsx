import React, { useState, useLayoutEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList,
  TouchableWithoutFeedback,
  ActivityIndicator,
  StyleSheet,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useNavigation } from "@react-navigation/native";
import AwesomeAlert from "react-native-awesome-alerts";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";

const roles = [
  { label: "Client", value: "CLIENT" },
  { label: "Vendeur", value: "VENDEUR" },
  { label: "Livreur", value: "LIVREUR" },
];

export default function SignupScreen() {
  const router = useRouter();
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentDropdown, setCurrentDropdown] = useState("");
  const [role, setRole] = useState("");

  // Champs communs
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [login, setLogin] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [telephone, setTelephone] = useState("");
  const [adresse, setAdresse] = useState("");

  // Champs livreur
  const [depotGarantie, setDepotGarantie] = useState("");
  const [disponible, setDisponible] = useState(false);
  const [matriculeVehicule, setMatriculeVehicule] = useState("");
  const [estValideParAdmin, setestValideParAdmin] = useState(false);
  const [photoProfil, setPhotoProfil] = useState(null);
  const [pieceIdentite, setPieceIdentite] = useState(null);
  const [assuranceVehicule, setAssuranceVehicule] = useState(null);
  const [preuveDepotGarantie, setPreuveDepotGarantie] = useState(null);
  const [livreurId, setLivreurId] = useState(null);

  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  // --- Gestion des fichiers ---
  const handlePieceJointe = async (setter, typePj) => {
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: "*/*" });
      if (!res.canceled && res.assets?.length > 0) {
        const file = res.assets[0];
        setter(file);
        if (livreurId) await uploadFile(file, livreurId, typePj);
      }
    } catch (err) {
      console.log("Erreur sélection fichier:", err);
    }
  };

  const handlePhotoProfil = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) {
      const file = result.assets[0];
      setPhotoProfil(file);
      if (livreurId) await uploadFile(file, livreurId, "LivreurFichier-photo");
    }
  };

  const uploadFile = async (file, idLivreur, typePj) => {
    const formData = new FormData();
    formData.append("file", file.file);
    formData.append("Id", idLivreur.toString());
    formData.append("typePjPlanAction", typePj);

    try {
      const response = await fetch("http://localhost:8082/api/uploadPj1/upload", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Erreur upload fichier");
      return await response.json();
    } catch (err) {
      console.error("❌ Upload error:", err);
      return null;
    }
  };

  // --- Envoi du formulaire ---
  const handleSubmit = async () => {
    if (!nom || !email || !motDePasse || !role) {
      setAlertTitle("Champs obligatoires");
      setAlertMessage("Veuillez remplir tous les champs requis.");
      setShowAlert(true);
      return;
    }

    const payload = { nom, prenom, email, login, motDePasse, telephone, adresse, role };
    if (role === "LIVREUR") {
      Object.assign(payload, { depotGarantie, disponible, matriculeVehicule,estValideParAdmin });
    }

    setLoading(true);
    try {
      const url =
        role === "CLIENT"
          ? "http://localhost:8082/api/clients"
          : role === "VENDEUR"
          ? "http://localhost:8082/api/vendeurs"
          : "http://localhost:8082/api/livreurs";

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.status === 201) {
        const data = await response.json();
        if (role === "LIVREUR") {
          setLivreurId(data.id);
          await Promise.all([
            photoProfil && uploadFile(photoProfil, data.id, "LivreurFichier-photo"),
            pieceIdentite && uploadFile(pieceIdentite, data.id, "LivreurFichier-cin"),
            assuranceVehicule && uploadFile(assuranceVehicule, data.id, "LivreurFichier-assurance"),
            preuveDepotGarantie && uploadFile(preuveDepotGarantie, data.id, "LivreurFichier-preuveDepot"),
          ]);
        }
        setAlertTitle("Succès");
        setAlertMessage("Inscription réussie !");
      } else {
        const text = await response.text();
        setAlertTitle("Erreur");
        setAlertMessage(text || "Échec d'inscription.");
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
            <Text style={styles.title}>Créer un compte</Text>

            {/* Sélection rôle */}
            <Text style={styles.label}>Rôle</Text>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => {
                setCurrentDropdown("role");
                setModalVisible(true);
              }}
            >
              <Text style={styles.dropdownText}>{role || "Choisir un rôle"}</Text>
            </TouchableOpacity>

            {/* Champs communs */}
            <TextInput style={styles.input} placeholder="Nom" placeholderTextColor="#cbd5e1" value={nom} onChangeText={setNom} />
            <TextInput style={styles.input} placeholder="Prénom" placeholderTextColor="#cbd5e1" value={prenom} onChangeText={setPrenom} />
            <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#cbd5e1" value={email} onChangeText={setEmail} />
            <TextInput style={styles.input} placeholder="Login" placeholderTextColor="#cbd5e1" value={login} onChangeText={setLogin} />
            <TextInput style={styles.input} placeholder="Mot de passe" placeholderTextColor="#cbd5e1" secureTextEntry value={motDePasse} onChangeText={setMotDePasse} />
            <TextInput style={styles.input} placeholder="Téléphone" placeholderTextColor="#cbd5e1" value={telephone} onChangeText={setTelephone} />
            <TextInput style={styles.input} placeholder="Adresse" placeholderTextColor="#cbd5e1" value={adresse} onChangeText={setAdresse} />

            {/* LIVREUR */}
            {role === "LIVREUR" && (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Dépôt de garantie"
                  placeholderTextColor="#cbd5e1"
                  value={depotGarantie}
                  onChangeText={setDepotGarantie}
                  keyboardType="numeric"
                />
                <TouchableOpacity
                  style={styles.dropdown}
                  onPress={() => setDisponible(!disponible)}
                >
                  <Text style={styles.dropdownText}>
                    {disponible ? "Disponible : Oui" : "Disponible : Non"}
                  </Text>
                </TouchableOpacity>
                <TextInput
                  style={styles.input}
                  placeholder="Matricule du véhicule"
                  placeholderTextColor="#cbd5e1"
                  value={matriculeVehicule}
                  onChangeText={setMatriculeVehicule}
                />

                {/* Pièces jointes */}
                <Text style={styles.label}>Pièces jointes</Text>
                <TouchableOpacity style={styles.dropdown} onPress={handlePhotoProfil}>
                  <Text style={styles.dropdownText}>
                    {photoProfil ? photoProfil.name : "Photo de profil"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.dropdown}
                  onPress={() => handlePieceJointe(setPieceIdentite, "LivreurFichier-cin")}
                >
                  <Text style={styles.dropdownText}>
                    {pieceIdentite ? pieceIdentite.name : "Pièce d’identité"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.dropdown}
                  onPress={() => handlePieceJointe(setAssuranceVehicule, "LivreurFichier-assurance")}
                >
                  <Text style={styles.dropdownText}>
                    {assuranceVehicule ? assuranceVehicule.name : "Assurance et carte grise"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.dropdown}
                  onPress={() => handlePieceJointe(setPreuveDepotGarantie, "LivreurFichier-preuveDepot")}
                >
                  <Text style={styles.dropdownText}>
                    {preuveDepotGarantie ? preuveDepotGarantie.name : "💰 Preuve du dépôt de garantie"}
                  </Text>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity style={styles.submit} onPress={handleSubmit} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitText}>Soumettre</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Sélecteur de rôle */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <FlatList
                data={roles}
                keyExtractor={(item) => item.value}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => {
                      setRole(item.value);
                      setModalVisible(false);
                    }}
                  >
                    <Text style={styles.modalItemText}>{item.label}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Alerte */}
      <AwesomeAlert
        show={showAlert}
        title={alertTitle}
        message={alertMessage}
        showConfirmButton
        confirmText="OK"
        confirmButtonColor="#2563eb"
        onConfirmPressed={() => {
          setShowAlert(false);
          if (alertTitle === "Succès") router.push("/");
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
    justifyContent: "center", // 💡 Centre verticalement
    alignItems: "center", // 💡 Centre horizontalement
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
  label: { color: "#cbd5e1", fontSize: 14, marginBottom: 5 },
  input: {
    borderWidth: 1,
    borderColor: "#475569",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    color: "#f1f5f9",
    backgroundColor: "rgba(51,65,85,0.5)",
  },
  dropdown: {
    borderWidth: 1,
    borderColor: "#475569",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    backgroundColor: "rgba(51,65,85,0.5)",
  },
  dropdownText: { color: "#f1f5f9" },
  submit: {
    backgroundColor: "#2563eb",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  submitText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "#1e293b",
    borderRadius: 10,
    width: "80%",
    paddingVertical: 10,
  },
  modalItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: "#334155" },
  modalItemText: { color: "#f1f5f9", fontSize: 16 },
});
