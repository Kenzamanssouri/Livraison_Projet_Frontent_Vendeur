// ProduitsScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Image,
  Alert,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { Picker } from "@react-native-picker/picker";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

export default function ProduitsScreen() {
  const API_BASE_URL = "http://localhost:8082";

  const [produits, setProduits] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [size] = useState(6);
  const [totalPages, setTotalPages] = useState(1);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  const [newProduit, setNewProduit] = useState({
    nom: "",
    description: "",
    prix: "",
    imageUri: null as string | null,
    categorieId: null as number | null,
  });

  const [produitImages, setProduitImages] = useState<Record<number, string>>({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedProduitId, setSelectedProduitId] = useState<number | null>(null);

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailProduit, setDetailProduit] = useState<any>(null);

  useEffect(() => {
    loadProduits();
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search]);

  // -------------------------
  // 🔥 Load produits paginés
  // -------------------------
  const loadProduits = async () => {
    try {
      const vendeurId = await AsyncStorage.getItem("userId");

      const response = await fetch(
        `${API_BASE_URL}/api/produits/paged?vendeurId=${vendeurId}&page=${page}&size=${size}&search=${encodeURIComponent(
          search
        )}`
      );

      if (!response.ok) {
        console.log("Erreur API produits", response.status);
        return;
      }

      const data = await response.json();
      setProduits(data.content || []);
      setTotalPages(data.totalPages ?? 1);

      // 🔥 charger les images PJ
      (data.content || []).forEach((p: any) => {
        if (p?.id) loadProduitImage(p.id);
      });
    } catch (e) {
      console.error("Erreur loadProduits", e);
    }
  };

  const loadProduitImage = async (produitId: number) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/uploadPj1/by-Id-type/${produitId}/imageProduit`
      );

      if (res.status === 204) return; // pas d'image
      if (!res.ok) return;

      const pjs = await res.json();

      if (pjs && pjs.length > 0) {
        const pj = pjs[0]; // première image
        const imageUrl = `${API_BASE_URL}/api/uploadPj1/download/id/${pj.id}`;

        setProduitImages((prev) => ({
          ...prev,
          [produitId]: imageUrl,
        }));
      }
    } catch (e) {
      console.error("Erreur chargement image produit", produitId, e);
    }
  };

  const openDetails = (produit: any) => {
    setDetailProduit(produit);
    setShowDetailModal(true);
  };

  // -------------------------
  // 🔥 Load catégories
  // -------------------------
  const loadCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/categories`);

      if (!response.ok) {
        console.log("Erreur API categories", response.status);
        setCategories([]);
        return;
      }

      const text = await response.text();
      if (!text) {
        setCategories([]);
        return;
      }

      const data = JSON.parse(text);
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erreur loadCategories", error);
      setCategories([]);
    }
  };

  // -------------------------
  // 🔥 Save produit (POST/PUT)
  // -------------------------
  const saveProduit = async () => {
    try {
      const vendeurId = await AsyncStorage.getItem("userId");

      const payload = {
        nom: newProduit.nom,
        description: newProduit.description,
        prix: Number(newProduit.prix),
        vendeur: vendeurId ? { id: Number(vendeurId) } : null,
        categorie: newProduit.categorieId ? { id: newProduit.categorieId } : null,
      };

      const url = isEditMode
        ? `${API_BASE_URL}/api/produits/${selectedProduitId}`
        : `${API_BASE_URL}/api/produits`;

      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        Alert.alert("Erreur", "Erreur lors de l'enregistrement");
        return;
      }

      const produit = await response.json();

      // upload image si modifiée
      if (newProduit.imageUri && !newProduit.imageUri.startsWith("http")) {
        await uploadProduitImage(newProduit.imageUri, produit.id);
      }

      // reset
      setShowAddModal(false);
      setIsEditMode(false);
      setSelectedProduitId(null);

      setNewProduit({
        nom: "",
        description: "",
        prix: "",
        imageUri: null,
        categorieId: null,
      });

      await loadProduits();
    } catch (e) {
      console.error("Erreur saveProduit", e);
      Alert.alert("Erreur", "Une erreur s'est produite");
    }
  };

  const base64ToBlob = (base64: string, mime: string) => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mime });
  };

  const sanitizeFileName = (text: string) =>
    text
      .toLowerCase()
      .normalize("NFD") // enlever accents
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "");

  const uploadProduitImage = async (imageUri: string, produitId: number) => {
    const formData = new FormData();

    // cas 1: imageUri = data URL base64
    if (imageUri.startsWith("data:")) {
      const base64Data = imageUri.split(",")[1];
      const mimeType = imageUri.match(/data:(.*);base64/)?.[1] || "image/jpeg";
      const blob = base64ToBlob(base64Data, mimeType);

      const extension = mimeType.split("/")[1] || "jpg";
      const cleanName = sanitizeFileName(newProduit.nom || "produit");
      const fileName = `${cleanName}_${produitId}.${extension}`;

      formData.append("file", blob as any, fileName);
    } else {
      // cas 2: imageUri = file://...
      const cleanName = sanitizeFileName(newProduit.nom || "produit");
      const fileName = `${cleanName}_${produitId}.jpg`;

      formData.append(
        "file",
        {
          uri: imageUri,
          name: fileName,
          type: "image/jpeg",
        } as any
      );
    }

    formData.append("Id", String(produitId));
    formData.append("typePjPlanAction", "imageProduit");

    const res = await fetch(`${API_BASE_URL}/api/uploadPj1/upload`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const err = await res.text();
      console.error(err);
      throw new Error("Upload failed");
    }

    // refresh image URL
    await loadProduitImage(produitId);
  };

  // -------------------------
  // ✅ Import Excel (depuis popup)
  // -------------------------
  const importExcel = async () => {
    try {
      const file = await DocumentPicker.getDocumentAsync({
        type: [
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ],
      });

      if (file.canceled) return;

      const form = new FormData();
      form.append(
        "file",
        {
          uri: file.assets[0].uri,
          name: file.assets[0].name,
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        } as any
      );

      const res = await fetch(`${API_BASE_URL}/api/produits/import`, {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        Alert.alert("Erreur", "Import Excel échoué");
        return;
      }

      setShowImportModal(false);
      await loadProduits();
      Alert.alert("OK", "Import Excel terminé");
    } catch (e) {
      console.error("Erreur importExcel", e);
      Alert.alert("Erreur", "Une erreur s'est produite lors de l'import");
    }
  };

  // -------------------------
  // ✅ Télécharger modèle Excel
  // -------------------------
  // ⚠️ Backend requis: GET /api/produits/template -> retourne produits_template.xlsx
  const downloadExcelTemplate = async () => {
    try {
      const url = `${API_BASE_URL}/api/produits/template`;
      const fileUri = `${FileSystem.documentDirectory}produits_template.xlsx`;

      const res = await FileSystem.downloadAsync(url, fileUri);

      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) {
        Alert.alert(
          "Info",
          Platform.OS === "android"
            ? `Fichier téléchargé: ${res.uri}`
            : "Partage non disponible sur cet appareil"
        );
        return;
      }

      await Sharing.shareAsync(res.uri);
    } catch (e) {
      console.error("Erreur downloadExcelTemplate", e);
      Alert.alert("Erreur", "Impossible de télécharger le modèle Excel");
    }
  };

  // -------------------------
  // 🔥 Toggle status
  // -------------------------
  const toggleStatus = async (id: number) => {
    try {
      await fetch(`${API_BASE_URL}/api/produits/${id}/toggle`, { method: "PUT" });
      await loadProduits();
    } catch (e) {
      console.error("Erreur toggleStatus", e);
    }
  };

  // -------------------------
  // 🔥 Delete
  // -------------------------
  const deleteProduit = async (id: number) => {
    try {
      await fetch(`${API_BASE_URL}/api/produits/${id}`, { method: "DELETE" });
      await loadProduits();
    } catch (e) {
      console.error("Erreur deleteProduit", e);
    }
  };

  const onEditProduit = (produit: any) => {
    setIsEditMode(true);
    setSelectedProduitId(produit.id);

    setNewProduit({
      nom: produit.nom,
      description: produit.description || "",
      prix: String(produit.prix),
      imageUri: produitImages[produit.id] || null,
      categorieId: produit.categorie?.id || null,
    });

    setShowAddModal(true);
  };

  // -------------------------
  // 🔥 Pick image
  // -------------------------
  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return alert("Permission refusée");

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      setNewProduit({ ...newProduit, imageUri: result.assets[0].uri });
    }
  };

  // -------------------------
  // RENDER
  // -------------------------
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gestion des Produits</Text>

      <TextInput
        placeholder="Recherche..."
        value={search}
        onChangeText={(t) => {
          setSearch(t);
          setPage(0);
        }}
        style={styles.input}
      />

      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.btn} onPress={() => setShowAddModal(true)}>
          <Text style={styles.btnText}>➕ Ajouter</Text>
        </TouchableOpacity>

        {/* ✅ Nouveau bouton: Ajouter plusieurs produits (Excel) */}
        <TouchableOpacity style={styles.btn} onPress={() => setShowImportModal(true)}>
          <Text style={styles.btnText}>📦 Ajouter plusieurs</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={produits}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {produitImages[item.id] ? (
              <Image
                source={{ uri: produitImages[item.id] }}
                style={styles.img}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.img, { backgroundColor: "#334155" }]} />
            )}

            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{item.nom}</Text>
              <Text style={styles.cardPrice}>{item.prix} MAD</Text>
              <Text style={{ color: "#94a3b8", fontSize: 12 }}>
                {item.categorie?.nom}
              </Text>
            </View>

            <View>
              <TouchableOpacity onPress={() => toggleStatus(item.id)}>
                <Text style={styles.link}>
                  {item.actif ? "🟢 Actif" : "🔴 Inactif"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => deleteProduit(item.id)}>
                <Text style={[styles.link, { color: "red" }]}>🗑 Supprimer</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => onEditProduit(item)}>
                <Text style={styles.link}>✏️ Modifier</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => openDetails(item)}>
                <Text style={styles.link}>👁 Détails</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Pagination */}
      <View style={styles.pagination}>
        <TouchableOpacity disabled={page === 0} onPress={() => setPage(page - 1)}>
          <Text style={styles.pageBtn}>⬅</Text>
        </TouchableOpacity>

        <Text style={styles.pageText}>
          {page + 1} / {totalPages}
        </Text>

        <TouchableOpacity
          disabled={page + 1 >= totalPages}
          onPress={() => setPage(page + 1)}
        >
          <Text style={styles.pageBtn}>➡</Text>
        </TouchableOpacity>
      </View>

      {/* =========================
          MODAL: Ajouter / Modifier
         ========================= */}
      <Modal visible={showAddModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              {isEditMode ? "✏️ Modifier le produit" : "🛒 Nouveau produit"}
            </Text>
            <Text style={styles.modalSubtitle}>Ajoutez les informations du produit</Text>

            <TextInput
              placeholder="Nom du produit"
              value={newProduit.nom}
              onChangeText={(t) => setNewProduit({ ...newProduit, nom: t })}
              style={styles.modalInput}
            />

            <TextInput
              placeholder="Description"
              value={newProduit.description}
              onChangeText={(t) => setNewProduit({ ...newProduit, description: t })}
              style={[styles.modalInput, styles.textArea]}
              multiline
            />

            <TextInput
              placeholder="Prix (MAD)"
              keyboardType="numeric"
              value={newProduit.prix}
              onChangeText={(t) => setNewProduit({ ...newProduit, prix: t })}
              style={styles.modalInput}
            />

            <View style={styles.selectWrapper}>
              <Text style={styles.selectLabel}>Catégorie</Text>

              <View style={styles.selectBox}>
                <Text style={styles.selectIcon}>📂</Text>

                <Picker
                  selectedValue={newProduit.categorieId}
                  onValueChange={(v) => setNewProduit({ ...newProduit, categorieId: v })}
                  style={styles.selectPicker}
                  dropdownIconColor="#1E293B"
                >
                  <Picker.Item label="Choisir une catégorie" value={null} />
                  {categories.map((c) => (
                    <Picker.Item key={c.id} label={c.nom} value={c.id} />
                  ))}
                </Picker>
              </View>
            </View>

            <TouchableOpacity style={styles.imageBtn} onPress={pickImage}>
              <Text style={styles.imageBtnText}>📷 Ajouter une image</Text>
            </TouchableOpacity>

            {newProduit.imageUri && (
              <Image source={{ uri: newProduit.imageUri }} style={styles.imagePreview} />
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.cancelBtn]}
                onPress={() => {
                  setShowAddModal(false);
                  setIsEditMode(false);
                  setSelectedProduitId(null);
                }}
              >
                <Text style={styles.actionTextCancel}>Annuler</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.actionBtn, styles.saveBtn]} onPress={saveProduit}>
                <Text style={styles.actionTextSave}>
                  {isEditMode ? "Mettre à jour" : "Enregistrer"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* =========================
          MODAL: Détails
         ========================= */}
      <Modal visible={showDetailModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {detailProduit && (
              <>
                {produitImages[detailProduit.id] ? (
                  <Image
                    source={{ uri: produitImages[detailProduit.id] }}
                    style={{
                      width: 150,
                      height: 150,
                      alignSelf: "center",
                      borderRadius: 12,
                      marginBottom: 12,
                    }}
                  />
                ) : (
                  <View
                    style={{
                      width: 150,
                      height: 150,
                      alignSelf: "center",
                      borderRadius: 12,
                      marginBottom: 12,
                      backgroundColor: "#E2E8F0",
                    }}
                  />
                )}

                <Text style={styles.modalTitle}>{detailProduit.nom}</Text>
                <Text style={{ marginBottom: 8 }}>{detailProduit.description}</Text>
                <Text>💰 {detailProduit.prix} MAD</Text>
                <Text>📂 {detailProduit.categorie?.nom}</Text>
              </>
            )}

            <TouchableOpacity
              style={[styles.actionBtn, styles.cancelBtn, { marginTop: 16 }]}
              onPress={() => setShowDetailModal(false)}
            >
              <Text style={styles.actionTextCancel}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* =========================
          MODAL: Ajouter plusieurs (Excel)
         ========================= */}
      <Modal visible={showImportModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>📦 Ajouter plusieurs produits</Text>
            <Text style={styles.modalSubtitle}>
              Téléchargez le modèle Excel, remplissez-le puis importez-le
            </Text>

            <TouchableOpacity style={styles.imageBtn} onPress={downloadExcelTemplate}>
              <Text style={styles.imageBtnText}>📥 Télécharger modèle Excel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.imageBtn, { backgroundColor: "#DCFCE7" }]}
              onPress={importExcel}
            >
              <Text style={[styles.imageBtnText, { color: "#166534" }]}>
                📤 Importer fichier Excel
              </Text>
            </TouchableOpacity>

            <Text style={{ fontSize: 12, color: "#64748B", marginTop: 10 }}>
              ℹ️ Colonne “image” = nom du fichier (ex: pizza.jpg). Les images s’ajoutent ensuite
              via “Modifier”.
            </Text>

            <TouchableOpacity
              style={[styles.actionBtn, styles.cancelBtn, { marginTop: 16 }]}
              onPress={() => setShowImportModal(false)}
            >
              <Text style={styles.actionTextCancel}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// -------------------------
// STYLES
// -------------------------
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#0A1A2F" },
  title: { fontSize: 22, fontWeight: "bold", color: "white", marginBottom: 10 },
  input: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 8,
    marginVertical: 10,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    gap: 10,
  },
  btn: { backgroundColor: "#1E40AF", padding: 10, borderRadius: 8, flex: 1 },
  btnText: { color: "white", fontWeight: "bold", textAlign: "center" },

  card: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 10,
    marginVertical: 5,
    alignItems: "center",
  },
  img: { width: 60, height: 60, borderRadius: 6, marginRight: 10 },
  cardTitle: { color: "white", fontSize: 16, fontWeight: "bold" },
  cardPrice: { color: "#38bdf8" },
  link: { color: "#60a5fa", marginVertical: 3 },

  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 10,
  },
  pageBtn: { color: "white", fontSize: 20, marginHorizontal: 20 },
  pageText: { color: "white", fontSize: 16 },

  // Modal base
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 16,
  },
  modalInput: {
    backgroundColor: "#F1F5F9",
    padding: 14,
    borderRadius: 14,
    fontSize: 14,
    marginBottom: 12,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },

  // Select
  selectWrapper: { marginBottom: 14 },
  selectLabel: {
    fontSize: 13,
    color: "#475569",
    marginBottom: 6,
    fontWeight: "600",
  },
  selectBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 52,
  },
  selectIcon: { fontSize: 18, marginRight: 6 },
  selectPicker: { flex: 1, color: "#0F172A" },

  // Image
  imageBtn: {
    backgroundColor: "#E0E7FF",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 10,
  },
  imageBtnText: {
    color: "#1E3A8A",
    fontWeight: "600",
  },
  imagePreview: {
    width: 120,
    height: 120,
    borderRadius: 16,
    alignSelf: "center",
    marginVertical: 10,
  },

  // Actions
  modalActions: { flexDirection: "row", gap: 12, marginTop: 16 },
  actionBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
  },
  cancelBtn: { backgroundColor: "#CBD5E1" },
  saveBtn: { backgroundColor: "#2563EB" },
  actionTextCancel: { color: "#1E293B", fontWeight: "700" },
  actionTextSave: { color: "#FFFFFF", fontWeight: "700" },
});
