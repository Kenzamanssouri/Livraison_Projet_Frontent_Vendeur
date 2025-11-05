import React, { useState, useLayoutEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList,
  TouchableWithoutFeedback,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';

// Dropdown roles
const roles = [
  { label: 'Client', value: 'CLIENT' },
  { label: 'Vendeur', value: 'VENDEUR' },
  { label: 'Livreur', value: 'LIVREUR' },
];

export default function SignupScreen() {
  const router = useRouter();
  const navigation = useNavigation();

  // Supprimer le header
  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentDropdown, setCurrentDropdown] = useState('');
  
  // Rôle
  const [role, setRole] = useState('');

  // Champs communs
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [login, setLogin] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [telephone, setTelephone] = useState('');
  const [adresse, setAdresse] = useState('');
  const [ville, setVille] = useState('');

  // Champs Vendeur
  const [nomEtablissement, setNomEtablissement] = useState('');
  const [categorie, setCategorie] = useState('');
  const [registreCommerce, setRegistreCommerce] = useState('');
  const [identifiantFiscal, setIdentifiantFiscal] = useState('');
  const [rib, setRib] = useState('');
  const [horaireOuverture, setHoraireOuverture] = useState({
    jour: '',
    heureOuverture: '',
    heureFermeture: '',
  });

  // Champs Livreur
  const [depotGarantie, setDepotGarantie] = useState('');
  const [disponible, setDisponible] = useState(false);

  // Dropdown options
  const villes = ['Casablanca', 'Rabat', 'Kenitra', 'Marrakech', 'Fes', 'Tanger', 'Agadir', 'Meknes', 'Oujda'];
  const jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  const heures = Array.from({ length: 18 }, (_, i) => `${(6 + i).toString().padStart(2, '0')}:00`);

  const handleDropdownSelect = (value) => {
    if (currentDropdown === 'ville') setVille(value);
    else if (currentDropdown === 'jour') setHoraireOuverture({ ...horaireOuverture, jour: value });
    else if (currentDropdown === 'heureOuverture') setHoraireOuverture({ ...horaireOuverture, heureOuverture: value });
    else if (currentDropdown === 'heureFermeture') setHoraireOuverture({ ...horaireOuverture, heureFermeture: value });
    setModalVisible(false);
  };

  const handleSubmit = async () => {
    if (!nom || !email || !motDePasse || !role) {
      Alert.alert('Champs obligatoires', 'Veuillez remplir tous les champs requis.');
      return;
    }

    let userData = {
      nom,
      prenom,
      email,
      login,
      motDePasse,
      telephone,
      adresse,
      ville,
      role,
    };

    // Champs spécifiques selon le rôle
    if (role === 'VENDEUR') {
      userData = {
        ...userData,
        nomEtablissement,
        categorie,
        registreCommerce,
        identifiantFiscal,
        rib,
        horaireOuverture,
      };
    } else if (role === 'LIVREUR') {
      userData = {
        ...userData,
        depotGarantie,
        disponible,
      };
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8082/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        Alert.alert('Succès', 'Inscription réussie !');
        router.push('/login');
      } else {
        const error = await response.text();
        Alert.alert('Erreur', error);
      }
    } catch (error) {
      console.error('Erreur réseau:', error);
      Alert.alert('Erreur', 'Problème de connexion au serveur.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backButtonText}>← Retour</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Créer un compte</Text>

      {/* Rôle */}
      <Text style={styles.label}>Rôle</Text>
      <TouchableOpacity
        style={styles.dropdownToggle}
        onPress={() => {
          setCurrentDropdown('role');
          setModalVisible(true);
        }}
      >
        <Text style={styles.dropdownToggleText}>{role || 'Choisir un rôle'}</Text>
      </TouchableOpacity>

      {/* Champs communs */}
      <TextInput style={styles.input} placeholder="Nom" onChangeText={setNom} />
      <TextInput style={styles.input} placeholder="Prénom" onChangeText={setPrenom} />
      <TextInput style={styles.input} placeholder="Email" onChangeText={setEmail} keyboardType="email-address" />
      <TextInput style={styles.input} placeholder="Login" onChangeText={setLogin} />
      <TextInput style={styles.input} placeholder="Mot de passe" onChangeText={setMotDePasse} secureTextEntry />
      <TextInput style={styles.input} placeholder="Téléphone" onChangeText={setTelephone} keyboardType="phone-pad" />
      <TextInput style={styles.input} placeholder="Adresse" onChangeText={setAdresse} />

      {/* Ville dropdown */}
      <Text style={styles.label}>Ville</Text>
      <TouchableOpacity
        style={styles.dropdownToggle}
        onPress={() => { setCurrentDropdown('ville'); setModalVisible(true); }}
      >
        <Text style={styles.dropdownToggleText}>{ville || 'Choisir une ville'}</Text>
      </TouchableOpacity>

      {/* Champs Vendeur */}
      {role === 'VENDEUR' && (
        <>
          <TextInput style={styles.input} placeholder="Nom de l'établissement" onChangeText={setNomEtablissement} />
          <TextInput style={styles.input} placeholder="Catégorie" onChangeText={setCategorie} />
          <TextInput style={styles.input} placeholder="Registre de commerce" onChangeText={setRegistreCommerce} />
          <TextInput style={styles.input} placeholder="Identifiant fiscal" onChangeText={setIdentifiantFiscal} />
          <TextInput style={styles.input} placeholder="RIB (optionnel)" onChangeText={setRib} />

          <Text style={styles.label}>Jour d’ouverture</Text>
          <TouchableOpacity style={styles.dropdownToggle} onPress={() => { setCurrentDropdown('jour'); setModalVisible(true); }}>
            <Text style={styles.dropdownToggleText}>{horaireOuverture.jour || 'Choisir un jour'}</Text>
          </TouchableOpacity>

          <Text style={styles.label}>Heure d’ouverture</Text>
          <TouchableOpacity style={styles.dropdownToggle} onPress={() => { setCurrentDropdown('heureOuverture'); setModalVisible(true); }}>
            <Text style={styles.dropdownToggleText}>{horaireOuverture.heureOuverture || 'Choisir une heure'}</Text>
          </TouchableOpacity>

          <Text style={styles.label}>Heure de fermeture</Text>
          <TouchableOpacity style={styles.dropdownToggle} onPress={() => { setCurrentDropdown('heureFermeture'); setModalVisible(true); }}>
            <Text style={styles.dropdownToggleText}>{horaireOuverture.heureFermeture || 'Choisir une heure'}</Text>
          </TouchableOpacity>
        </>
      )}

      {/* Champs Livreur */}
      {role === 'LIVREUR' && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Dépôt de garantie"
            keyboardType="numeric"
            onChangeText={setDepotGarantie}
          />
          <Text>Disponible ?</Text>
          <TouchableOpacity onPress={() => setDisponible(!disponible)} style={styles.dropdownToggle}>
            <Text style={styles.dropdownToggleText}>{disponible ? 'Oui' : 'Non'}</Text>
          </TouchableOpacity>
        </>
      )}

      {/* Submit */}
      <View style={styles.buttonContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#1E40AF" />
        ) : (
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Soumettre</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Dropdown Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalContainer}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <FlatList
                  data={
                    currentDropdown === 'ville' ? villes :
                    currentDropdown === 'jour' ? jours :
                    currentDropdown === 'role' ? roles.map(r => r.value) :
                    heures
                  }
                  renderItem={({ item }) => (
                    <TouchableOpacity style={styles.modalItem} onPress={() => {
                      if(currentDropdown === 'role') setRole(item);
                      else handleDropdownSelect(item);
                    }}>
                      <Text style={styles.modalItemText}>{item}</Text>
                    </TouchableOpacity>
                  )}
                  keyExtractor={(item, index) => index.toString()}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#f0f4f8', flexGrow: 1 },
  backButton: { marginBottom: 10 },
  backButtonText: { color: '#1E40AF', fontSize: 16 },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 25, color: '#1E3A8A' },
  input: {
    borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 12,
    marginBottom: 15, padding: 14, fontSize: 16, backgroundColor: '#ffffff', color: '#1e293b',
    shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 5, elevation: 2,
  },
  label: { fontSize: 15, marginBottom: 5, color: '#334155', fontWeight: '500' },
  dropdownToggle: {
    padding: 14, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#cbd5e1',
    borderRadius: 12, marginBottom: 15, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5, elevation: 2,
  },
  dropdownToggleText: { fontSize: 16, color: '#1e293b' },
  buttonContainer: { marginTop: 20, borderRadius: 12, overflow: 'hidden' },
  submitButton: {
    backgroundColor: '#1E40AF', paddingVertical: 16, borderRadius: 12,
    alignItems: 'center', shadowColor: '#1e40af', shadowOpacity: 0.25, shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6, elevation: 4, marginBottom: 10,
  },
  submitButtonText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(30, 41, 59, 0.7)' },
  modalContent: { backgroundColor: '#f8fafc', borderRadius: 12, padding: 20, width: '80%', maxHeight: '50%' },
  modalItem: { padding: 14, borderBottomWidth: 1, borderColor: '#e2e8f0' },
  modalItemText: { fontSize: 16, color: '#1e293b' },
});
