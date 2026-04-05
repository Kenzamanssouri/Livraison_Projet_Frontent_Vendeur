import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ClientHeader({ username }) {
  const router = useRouter();

  const logout = async () => {
    await AsyncStorage.clear();
    router.replace("/login");
  };

  return (
    <View style={styles.header}>
      <Text style={styles.name}>👋 {username}</Text>

      <TouchableOpacity onPress={logout}>
        <Text style={styles.logout}>Déconnexion</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "rgba(30,41,59,0.95)",
  },
  name: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "600",
  },
  logout: {
    color: "#f87171",
    fontWeight: "bold",
  },
});
