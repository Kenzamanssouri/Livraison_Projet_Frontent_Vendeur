import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Switch,
  FlatList,
  Alert,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

const API = "http://localhost:8082";

export default function ParametreScreen() {
  const router = useRouter();

  const [vendeur, setVendeur] = useState<any>(null);
  const [vendeurCategories, setVendeurCategories] = useState<any[]>([]);
  const [pjs, setPjs] = useState<any[]>([]);

  const [showProfile, setShowProfile] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [showPjs, setShowPjs] = useState(false);
const [newPassword, setNewPassword] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");
const [showPassword, setShowPassword] = useState(false);
const [horairesOuverture, setHorairesOuverture] = useState<any[]>([]);
const [showHorairesModal, setShowHorairesModal] = useState(false);

const [currentJour, setCurrentJour] = useState("");
const [heureOuverture, setHeureOuverture] = useState("");
const [heureFermeture, setHeureFermeture] = useState("");

const jours = ["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi","Dimanche"];

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    const vendeurId = await AsyncStorage.getItem("userId");
    if (!vendeurId) return;

    fetch(`${API}/api/vendeurs/${vendeurId}`)
      .then(res => res.json())
      .then(setVendeur);
fetch(`${API}/api/vendeurs/${vendeurId}`)
  .then(res => res.json())
 .then(data => {
  setVendeur(data);
  setHorairesOuverture(
    (data.horairesOuverture || []).map((h: any) => ({
      id: h.id, // ✅ garder l'id
      jour: h.jour,
      heureOuverture: h.heureOuverture,
      heureFermeture: h.heureFermeture,
    }))
  );
});


    // fetch(`${API}/api/vendeur-categories/${vendeurId}`)
    //   .then(res => res.json())
    //   .then(setVendeurCategories);

    fetch(`${API}/api/uploadPj1/by-Id-type/${vendeurId}/vendeur`)
      .then(res => res.json())
      .then(setPjs);
  };

  // ---------------- PROFIL ----------------
const updateVendeur = async () => {
  // 🔐 Vérification mot de passe
  if (newPassword && newPassword !== confirmPassword) {
    Alert.alert("Erreur", "Les mots de passe ne correspondent pas");
    return;
  }

  const payload: any = {
    nom: vendeur.nom,
    prenom: vendeur.prenom,
    login: vendeur.login,
    telephone: vendeur.telephone,
    adresse: vendeur.adresse,
    nomEtablissement: vendeur.nomEtablissement,

  horairesOuverture: horairesOuverture.map((h) => ({
  ...(h.id ? { id: h.id } : {}), // ✅ id seulement s'il existe
  jour: h.jour,
  heureOuverture: h.heureOuverture,
  heureFermeture: h.heureFermeture,
})),

  };

  // 🔐 mot de passe seulement si modifié
  if (newPassword && newPassword.trim().length > 0) {
    payload.motDePasse = newPassword;
  }

  try {
    const res = await fetch(`${API}/api/vendeurs/${vendeur.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.text();
      Alert.alert("Erreur", err || "Échec de la mise à jour");
      return;
    }

    // ✅ succès
    setNewPassword("");
    setConfirmPassword("");
    setShowProfile(false);

    Alert.alert("Succès", "Profil mis à jour avec succès");
  } catch (e) {
    Alert.alert("Erreur", "Impossible de contacter le serveur");
  }
};



  // ---------------- CATEGORIES ----------------
  const toggleCategorie = async (id: number) => {
    await fetch(`${API}/api/vendeur-categories/${id}/toggle`, {
      method: "PUT",
    });
    loadAll();
  };

  // ---------------- DESACTIVATION ----------------
  const deactivateAccount = async () => {
    await fetch(`${API}/api/vendeurs/${vendeur.id}/deactivate`, {
      method: "PUT",
    });

    await AsyncStorage.clear();
    router.replace("/login");
  };

  const confirmDeactivate = () => {
    Alert.alert(
      "Confirmation",
      "Voulez-vous vraiment désactiver votre compte ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Désactiver",
          style: "destructive",
          onPress: deactivateAccount,
        },
      ]
    );
  };

  // ---------------- UI ----------------
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Paramétrage</Text>

      {/* PROFIL */}
      <TouchableOpacity style={styles.card} onPress={() => setShowProfile(true)}>
        <Text style={styles.cardTitle}>👤 Mon compte</Text>
        <Text style={styles.cardDesc}>Modifier mes informations</Text>
      </TouchableOpacity>

      {/* PJ */}
      <TouchableOpacity style={styles.card} onPress={() => setShowPjs(true)}>
        <Text style={styles.cardTitle}>📎 Mes documents</Text>
        <Text style={styles.cardDesc}>Visualiser mes pièces jointes</Text>
      </TouchableOpacity>

      {/* CATEGORIES */}
      <TouchableOpacity style={styles.card} onPress={() => setShowCategories(true)}>
        <Text style={styles.cardTitle}>🗂 Catégories</Text>
        <Text style={styles.cardDesc}>Activer / désactiver</Text>
      </TouchableOpacity>

      {/* DESACTIVATION */}
      <TouchableOpacity
        style={[styles.card, { backgroundColor: "#fee2e2" }]}
        onPress={confirmDeactivate}
      >
        <Text style={{ color: "#b91c1c", fontWeight: "700" }}>
          🔴 Désactiver mon compte
        </Text>
      </TouchableOpacity>

      {/* ================= MODALS ================= */}

      {/* PROFIL */}
  {/* PROFIL */}
<Modal visible={showProfile} transparent animationType="slide">
  <View style={styles.modalOverlay}>
    <View style={styles.modal}>
      <Text style={styles.modalTitle}>👤 Mon compte</Text>

      {/* -------- INFOS PERSONNELLES -------- */}
      <TextInput
        style={styles.input}
        value={vendeur?.nom}
        onChangeText={(t) => setVendeur({ ...vendeur, nom: t })}
        placeholder="Nom"
      />

      <TextInput
        style={styles.input}
        value={vendeur?.prenom}
        onChangeText={(t) => setVendeur({ ...vendeur, prenom: t })}
        placeholder="Prénom"
      />

      <TextInput
        style={[styles.input, { backgroundColor: "#e5e7eb" }]}
        value={vendeur?.email}
        editable={false}
        placeholder="Email"
      />

      <TextInput
        style={styles.input}
        value={vendeur?.telephone}
        onChangeText={(t) => setVendeur({ ...vendeur, telephone: t })}
        placeholder="Téléphone"
      />

      <TextInput
        style={styles.input}
        value={vendeur?.adresse}
        onChangeText={(t) => setVendeur({ ...vendeur, adresse: t })}
        placeholder="Adresse"
      />

      <TextInput
        style={styles.input}
        value={vendeur?.nomEtablissement}
        onChangeText={(t) =>
          setVendeur({ ...vendeur, nomEtablissement: t })
        }
        placeholder="Nom de l’établissement"
      />

      {/* -------- INFOS LECTURE SEULE -------- */}
      <View style={styles.infoBox}>
        <Text>🏷 Catégorie : {vendeur?.categorie}</Text>
        <Text>
          ✅ Statut :{" "}
          {vendeur?.estValideParAdmin ? "Validé" : "En attente"}
        </Text>
      </View>

      {/* -------- LOGIN -------- */}
      <TextInput
        style={styles.input}
        value={vendeur?.login}
        onChangeText={(t) => setVendeur({ ...vendeur, login: t })}
        placeholder="Login"
      />

      {/* -------- MOT DE PASSE -------- */}
      <TextInput
        style={styles.input}
        value={newPassword}
        onChangeText={setNewPassword}
        placeholder="Nouveau mot de passe"
        secureTextEntry={!showPassword}
      />

      <TextInput
        style={styles.input}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder="Confirmer le mot de passe"
        secureTextEntry={!showPassword}
      />

      <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
        <Text style={{ color: "#2563eb", marginBottom: 10 }}>
          {showPassword ? "🙈 Masquer" : "👁 Afficher"} le mot de passe
        </Text>
      </TouchableOpacity>

      {/* -------- HORAIRES D'OUVERTURE -------- */}
      <Text style={{ fontWeight: "700", marginTop: 10 }}>
        🕒 Horaires d'ouverture
      </Text>

      {horairesOuverture.length === 0 && (
        <Text style={{ color: "#64748b", marginVertical: 5 }}>
          Aucun horaire défini
        </Text>
      )}

      {horairesOuverture.map((h, index) => (
        <View key={index} style={styles.horaireRow}>
          <Text>
            {h.jour} : {h.heureOuverture} - {h.heureFermeture}
          </Text>

          <TouchableOpacity
            onPress={() =>
              setHorairesOuverture(
                horairesOuverture.filter((_, i) => i !== index)
              )
            }
          >
            <Text style={{ color: "red", fontSize: 16 }}>❌</Text>
          </TouchableOpacity>
        </View>
      ))}

      <TouchableOpacity
        style={styles.addHoraireBtn}
        onPress={() => setShowHorairesModal(true)}
      >
        <Text style={{ color: "white", fontWeight: "700" }}>
          ➕ Ajouter un horaire
        </Text>
      </TouchableOpacity>

      {/* -------- ACTIONS -------- */}
      <TouchableOpacity style={styles.saveBtn} onPress={updateVendeur}>
        <Text style={{ color: "white", fontWeight: "700" }}>
          Enregistrer
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setShowProfile(false)}>
        <Text style={styles.cancel}>Annuler</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>
{/* ================= MODAL AJOUT HORAIRE ================= */}
<Modal visible={showHorairesModal} transparent animationType="fade">
  <View style={styles.modalOverlay}>
    <View style={styles.modal}>

      {!currentJour ? (
        <>
          <Text style={styles.modalTitle}>🗓 Choisir un jour</Text>

          {jours.map((j) => (
            <TouchableOpacity
              key={j}
              style={styles.row}
              onPress={() => setCurrentJour(j)}
            >
              <Text>{j}</Text>
            </TouchableOpacity>
          ))}
        </>
      ) : (
        <>
          <Text style={styles.modalTitle}>🕒 {currentJour}</Text>

          <TextInput
            style={styles.input}
            placeholder="Heure ouverture (ex: 08:00)"
            value={heureOuverture}
            onChangeText={setHeureOuverture}
          />

          <TextInput
            style={styles.input}
            placeholder="Heure fermeture (ex: 18:00)"
            value={heureFermeture}
            onChangeText={setHeureFermeture}
          />

          <TouchableOpacity
            style={styles.saveBtn}
            onPress={() => {
              if (!heureOuverture || !heureFermeture) {
                Alert.alert("Erreur", "Veuillez renseigner les deux heures");
                return;
              }

           // 🚫 Vérifier si le jour existe déjà
const jourExiste = horairesOuverture.some(
  (h) => h.jour === currentJour
);

if (jourExiste) {
  Alert.alert(
    "Horaire déjà défini",
    `Un horaire existe déjà pour ${currentJour}`
  );
  return;
}

// ✅ Ajouter l'horaire
setHorairesOuverture([
  ...horairesOuverture,
  {
    jour: currentJour,
    heureOuverture,
    heureFermeture,
  },
]);

// RESET
setCurrentJour("");
setHeureOuverture("");
setHeureFermeture("");
setShowHorairesModal(false);


            }}
          >
            <Text style={{ color: "white", fontWeight: "700" }}>
              ✅ Ajouter
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setCurrentJour("")}
          >
            <Text style={styles.cancel}>← Retour</Text>
          </TouchableOpacity>
        </>
      )}

    </View>
  </View>
</Modal>



      {/* CATEGORIES */}
      <Modal visible={showCategories} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Catégories</Text>

            <FlatList
              data={vendeurCategories}
              keyExtractor={(i) => i.id.toString()}
              renderItem={({ item }) => (
                <View style={styles.row}>
                  <Text>{item.categorie.nom}</Text>
                  <Switch
                    value={item.actif}
                    onValueChange={() => toggleCategorie(item.id)}
                  />
                </View>
              )}
            />

            <TouchableOpacity onPress={() => setShowCategories(false)}>
              <Text style={styles.cancel}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* PJ */}
      <Modal visible={showPjs} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Documents</Text>

            {pjs.map((pj) => (
              <TouchableOpacity key={pj.id}>
                <Text>📄 {pj.nom || "Document"}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity onPress={() => setShowPjs(false)}>
              <Text style={styles.cancel}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
const styles = StyleSheet.create({
  infoBox: {
  backgroundColor: "#f8fafc",
  padding: 10,
  borderRadius: 10,
  marginVertical: 8,
},

horaireRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  paddingVertical: 4,
},

addHoraireBtn: {
  backgroundColor: "#2563eb",
  padding: 10,
  borderRadius: 10,
  alignItems: "center",
  marginTop: 8,
},

  container: { flex: 1, padding: 16, backgroundColor: "#0A1A2F" },
  title: { fontSize: 22, fontWeight: "700", color: "white", marginBottom: 16 },

  card: {
    backgroundColor: "#0f172a",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  cardTitle: { color: "white", fontSize: 16, fontWeight: "700" },
  cardDesc: { color: "#94a3b8", fontSize: 13 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: "white",
    width: "90%",
    padding: 20,
    borderRadius: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12 },

  input: {
    backgroundColor: "#f1f5f9",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },

  saveBtn: {
    backgroundColor: "#2563eb",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },

  cancel: {
    textAlign: "center",
    marginTop: 10,
    color: "#64748b",
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
});
