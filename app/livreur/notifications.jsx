import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";

const BASE_URL = "http://localhost:8082";

export default function NotificationsPage() {
  const router = useRouter();

  const [notifications, setNotifications] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadNotifications(0);
  }, []);

  const loadNotifications = async (pageNumber) => {
    if (loading) return;

    setLoading(true);
    try {
      const res = await fetch(
        `${BASE_URL}/api/notification/livreur?page=${pageNumber}&size=5`
      );

      const data = await res.json();

      setNotifications(data.content);
      setTotalPages(data.totalPages);
      setPage(data.number);
    } catch (e) {
      console.log("Erreur notifications", e);
    }
    setLoading(false);
  };

  /* 📬 CLICK NOTIFICATION */
const handleClick = async (notif) => {
  try {
    await fetch(
      `${BASE_URL}/api/notification/${notif.id}/open`,
      { method: "PUT" }
    );

    router.push({
      pathname: "/livreur/commande/[id]",
      params: { id: notif.idObject },
    });
  } catch (e) {
    console.log("Erreur open notif", e);
  }
};

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.card,
        !item.opened && styles.unreadCard
      ]}
      onPress={() => handleClick(item)}
    >
      <Text style={styles.message}>{item.message}</Text>
      <Text style={styles.sub}>Commande #{item.idObject}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {loading && page === 0 ? (
        <ActivityIndicator size="large" color="#2563eb" />
      ) : (
        <>
          <FlatList
            data={notifications}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
          />

          {/* Pagination */}
          <View style={styles.pagination}>
            <TouchableOpacity
              disabled={page === 0}
              onPress={() => loadNotifications(page - 1)}
              style={styles.pageBtn}
            >
              <Text style={styles.pageText}>⬅</Text>
            </TouchableOpacity>

            <Text style={styles.pageInfo}>
              Page {page + 1} / {totalPages}
            </Text>

            <TouchableOpacity
              disabled={page + 1 >= totalPages}
              onPress={() => loadNotifications(page + 1)}
              style={styles.pageBtn}
            >
              <Text style={styles.pageText}>➡</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    padding: 20,
  },
  card: {
    backgroundColor: "#1e293b",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#2563eb",
  },
  message: {
    color: "#f8fafc",
    fontWeight: "bold",
  },
  sub: {
    color: "#94a3b8",
    marginTop: 5,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
  },
  pageBtn: {
    backgroundColor: "#2563eb",
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 10,
  },
  pageText: {
    color: "white",
    fontWeight: "bold",
  },
  pageInfo: {
    color: "#cbd5e1",
  },
});