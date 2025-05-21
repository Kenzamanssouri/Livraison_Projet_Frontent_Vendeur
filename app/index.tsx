import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenue sur Vendeur Connecté</Text>
      <View style={styles.buttonContainer}>
        <Button title="Créer un compte" onPress={() => router.push('/signup')} color="#1E90FF" />
      </View>
      <View style={styles.buttonContainer}>
        <Button title="Se connecter" onPress={() => router.push('/login')} color="#32CD32" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#f8f9fa' },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 40, textAlign: 'center', color: '#333' },
  buttonContainer: { width: '80%', marginBottom: 15 }
});