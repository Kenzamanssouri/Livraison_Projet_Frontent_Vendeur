import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";

export default function CommandeDetails() {
  const { id } = useLocalSearchParams();
  const [commande, setCommande] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchCommande = async () => {
      try {
        const res = await fetch(
          `http://localhost:8082/api/commandes/${id}`
        );

        if (!res.ok) {
          throw new Error("Impossible de charger la commande");
        }

        const data = await res.json();debugger
        setCommande(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchCommande();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color="#fff" />
      </View>
    );
  }

  if (!commande) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Commande introuvable</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Détails de la commande</Text>

      <Text style={styles.label}>
        ID : <Text style={styles.value}>{commande.id}</Text>
      </Text>

      <Text style={styles.label}>
        Adresse : <Text style={styles.value}>{commande.livraisonAdresse}</Text>
      </Text>

     

      <Text style={styles.label}>
        Statut : <Text style={styles.value}>{commande.statut}</Text>
      </Text>

      <Text style={[styles.label, { marginTop: 20 }]}>
        Lignes de commande :
      </Text>

      {commande.lignes && commande.lignes.length > 0 ? (
        commande.lignes.map((ligne) => (
          <View key={ligne.id} style={{ marginTop: 10, paddingLeft: 10 }}>
            <Text style={styles.label}>
              Quantité : <Text style={styles.value}>{ligne.quantite}</Text>
            </Text>
            <Text style={styles.label}>
              Description :{" "}
              <Text style={styles.value}>{ligne.descriptionLibre}</Text>
            </Text>
          </View>
        ))
      ) : (
        <Text style={styles.value}>Aucune ligne</Text>
      )}
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
  label: {
    color: "#94a3b8",
    marginTop: 10,
    fontWeight: "600",
  },
  value: {
    color: "#f1f5f9",
    fontWeight: "400",
  },
  text: {
    color: "#f8fafc",
    textAlign: "center",
  },
});
