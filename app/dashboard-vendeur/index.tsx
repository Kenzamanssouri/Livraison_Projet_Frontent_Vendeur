import React, { useEffect, useState } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

type DashboardData = {
  totalCommandes?: number;
  today?: number;
  week?: number;
  status?: {
    EN_ATTENTE?: number;
    ACCEPTEE?: number;
    EN_PREPARATION?: number;
    EN_ROUTE?: number;
    LIVREE?: number;
    ANNULEE?: number;
  };
  revenueTotal?: number;
  revenueToday?: number;
  revenueWeek?: number;
  avgBasket?: number;
  paymentStats?: {
    cash?: number;
    card?: number;
  };
  // si tu ajoutes plus tard :
  // performance?: { acceptanceRate?: number; cancelRate?: number; ... }
};

export default function HomeScreen() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const vendeurId = await AsyncStorage.getItem("userId");
      if (!vendeurId) {
        console.log("❌ Aucun vendeurId trouvé dans AsyncStorage");
        return;
      }

      const response = await fetch(
        `http://localhost:8082/api/commandes/dashboard?vendeurId=${vendeurId}`
      );

      if (!response.ok) {
        console.log("❌ Erreur API dashboard:", response.status);
        return;
      }

      const data = await response.json();
      setDashboard(data);
    } catch (error) {
      console.log("❌ Erreur loadDashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  // petit helper
  const display = (value: any, suffix: string = "") =>
    loading ? "Chargement..." : value != null ? `${value}${suffix}` : "—";

  return (
    <ScrollView style={styles.container}>
      {/* ======================== */}
      {/*        TITLE            */}
      {/* ======================== */}
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">📊 Tableau de Bord</ThemedText>
        <ThemedText>Indicateurs clés de votre commerce</ThemedText>
      </ThemedView>

      {/* ======================== */}
      {/* 1️⃣ VOLUME DES COMMANDES */}
      {/* ======================== */}
      <ThemedText type="subtitle" style={styles.sectionTitle}>
        🧩 Indicateurs liés aux commandes
      </ThemedText>

      <ThemedView style={styles.card}>
        <ThemedText type="defaultSemiBold">1.1 Volume des commandes</ThemedText>

        <KPI
          label="Total commandes"
          value={display(dashboard?.totalCommandes)}
        />
        <KPI
          label="Commandes du jour"
          value={display(dashboard?.today)}
        />
        <KPI
          label="Commandes de la semaine"
          value={display(dashboard?.week)}
        />
      </ThemedView>

      {/* ======================== */}
      {/* 1️⃣ BIS – STATUTS        */}
      {/* ======================== */}
      <ThemedView style={styles.card}>
        <ThemedText type="defaultSemiBold">1.2 Statut des commandes</ThemedText>

        <KPI
          label="En attente"
          value={display(dashboard?.status?.EN_ATTENTE)}
        />
        <KPI
          label="Acceptées"
          value={display(dashboard?.status?.ACCEPTEE)}
        />
        <KPI
          label="En préparation"
          value={display(dashboard?.status?.EN_PREPARATION)}
        />
        <KPI
          label="En route"
          value={display(dashboard?.status?.EN_ROUTE)}
        />
        <KPI
          label="Livrées"
          value={display(dashboard?.status?.LIVREE)}
        />
        <KPI
          label="Annulées"
          value={display(dashboard?.status?.ANNULEE)}
        />
      </ThemedView>

      {/* ======================== */}
      {/* 1️⃣ TER – PERFORMANCE    */}
      {/* (pour l’instant statique,
          tu pourras brancher plus tard sur le back) */}
      {/* ======================== */}
      {/*<ThemedView style={styles.card}>
        <ThemedText type="defaultSemiBold">1.3 Performance</ThemedText>
        <KPI label="Taux d'acceptation" value="92%" />
        <KPI label="Taux d'annulation" value="8%" />
        <KPI label="Préparation moyenne" value="18 min" />
        <KPI label="Livraison moyenne" value="27 min" />
        <KPI label="Délai moyen confirmation" value="1m 30s" />
      </ThemedView>*/}

      {/* ======================== */}
      {/* 2️⃣ VALEUR COMMERCIALE   */}
      {/* ======================== */}
      <ThemedText type="subtitle" style={styles.sectionTitle}>
        💰 Valeur commerciale
      </ThemedText>

      <ThemedView style={styles.card}>
        <ThemedText type="defaultSemiBold">2.1 Revenus</ThemedText>

        <KPI
          label="Revenus totaux"
          value={display(dashboard?.revenueTotal, " MAD")}
        />
        <KPI
          label="Revenus du jour"
          value={display(dashboard?.revenueToday, " MAD")}
        />
        <KPI
          label="Revenus de la semaine"
          value={display(dashboard?.revenueWeek, " MAD")}
        />
      {/*  <KPI
          label="Panier moyen"
          value={display(dashboard?.avgBasket, " MAD")}
        />*/}
      </ThemedView>

      <ThemedView style={styles.card}>
        <ThemedText type="defaultSemiBold">2.2 Moyens de paiement</ThemedText>

        <KPI
          label="Paiement espèces"
          value={display(dashboard?.paymentStats?.cash, " %")}
        />
        <KPI
          label="Paiement carte"
          value={display(dashboard?.paymentStats?.card, " %")}
        />
      </ThemedView>

      {/* si tu veux remettre plus tard une partie produits / resto,
          on pourra rajouter d’autres cartes ici */}
    </ScrollView>
  );
}

/* KPI Component */
function KPI({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.kpiRow}>
      <ThemedText>{label}</ThemedText>
      <ThemedText type="defaultSemiBold">{value}</ThemedText>
    </View>
  );}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#0A1A2F",
  },
  titleContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    marginTop: 25,
    marginBottom: 8,
  },
  card: {
    marginBottom: 16,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  kpiRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
});
