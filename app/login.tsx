import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const [phone, setPhone] = useState('');
  const router = useRouter();

  const handleLogin = () => {
    router.push('/dashboard');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connexion</Text>
      <TextInput style={styles.input} placeholder="Téléphone" keyboardType="phone-pad" onChangeText={setPhone} />
      <View style={styles.buttonContainer}>
        <Button title="Se connecter" onPress={handleLogin} color="#32CD32" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#f4f4f4' },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 30, textAlign: 'center', color: '#333' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 15,
    padding: 12,
    backgroundColor: '#fff',
    fontSize: 16
  },
  buttonContainer: {
    marginTop: 10
  }
});

