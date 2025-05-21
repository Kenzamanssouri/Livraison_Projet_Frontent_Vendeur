import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList,
  TouchableWithoutFeedback,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';

export default function SignupScreen() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [ville, setVille] = useState('');
  const villes = [
    'Casablanca', 'Rabat', 'Kenitra', 'Marrakech', 'Fes',
    'Tanger', 'Agadir', 'Meknes', 'Oujda',
  ];

  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [login, setLogin] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [telephone, setTelephone] = useState('');
  const [adresse, setAdresse] = useState('');
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

  const jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  const heures = Array.from({ length: 18 }, (_, i) => `${(6 + i).toString().padStart(2, '0')}:00`);

  const [modalVisible, setModalVisible] = useState(false);
  const [currentDropdown, setCurrentDropdown] = useState('');
  const [emailError, setEmailError] = useState('');
  const [piecesJointes, setPiecesJointes] = useState([]);

  const handleDropdownSelect = (value) => {
    if (currentDropdown === 'ville') setVille(value);
    else if (currentDropdown === 'jour') setHoraireOuverture({ ...horaireOuverture, jour: value });
    else if (currentDropdown === 'heureOuverture') setHoraireOuverture({ ...horaireOuverture, heureOuverture: value });
    else if (currentDropdown === 'heureFermeture') setHoraireOuverture({ ...horaireOuverture, heureFermeture: value });

    setModalVisible(false);
  };

  const handlePickDocument = async (typeFichier) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
      if (result.assets && result.assets.length > 0) {
        const fichier = result.assets[0];
        setPiecesJointes((prev) => [...prev, { fichier, typeFichier }]);
      }
    } catch (err) {
      console.error('Erreur lors de la sélection du fichier:', err);
    }
  };
  

  const handleSubmit = async () => {
    setEmailError('');

    if (!nom || !email || !motDePasse || !ville) {
      Alert.alert("Champs obligatoires", "Veuillez remplir tous les champs requis.");
      return;
    }

    const vendeurData = {
      nom,
      prenom,
      email,
      login,
      motDePasse,
      telephone,
      adresse,
      ville,
      role: 'VENDEUR',
      nomEtablissement,
      categorie,
      registreCommerce,
      identifiantFiscal,
      rib,
      estValideParAdmin: false,
      horaireOuverture,
    };

    setLoading(true);

    try {
      const response = await fetch('http://192.168.1.8:8082/api/vendeurs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vendeurData),
      });

      if (response.status === 409) {
        const errorMessage = await response.text();
        if (errorMessage.toLowerCase().includes('email')) {
          setEmailError(errorMessage);
        }
      } else if (response.ok) {
        const result = await response.json();
        console.log('Vendeur créé:', result);

        if (piecesJointes.length > 0) {
          const formData = new FormData();
          formData.append('vendeurId', result.id.toString());
          
          piecesJointes.forEach((pj) => {
            formData.append('pjFiles', {
              uri: pj.fichier.uri,
              name: pj.fichier.name || 'document.pdf',
              type: pj.fichier.mimeType || 'application/pdf', // important pour Android
            });
            formData.append('typesFichiers', pj.typeFichier); // même index
          });
          
        
          const uploadResponse = await fetch('http://192.168.1.8:8082/api/pieces-justificatives-vendeurs', {
            method: 'POST',
            headers: {
              // Pas de Content-Type ici, `fetch` le gère automatiquement pour `FormData`
              Accept: 'application/json',
            },
            body: formData,
          });
        
          if (!uploadResponse.ok) {
            const error = await uploadResponse.text();
            console.error('Erreur PJ:', error);
          } else {
            console.log('PJ envoyées avec succès');
          }
        }
        

        Alert.alert('Succès', 'Inscription réussie !');
        router.push('/login');
      } else {
        const error = await response.text();
        console.error('Erreur API:', error);
      }
    } catch (error) {
      console.error('Erreur réseau:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Créer un compte vendeur</Text>

      <TextInput style={styles.input} placeholder="Nom" onChangeText={setNom} />
      <TextInput style={styles.input} placeholder="Prénom" onChangeText={setPrenom} />
      <TextInput
        style={styles.input}
        placeholder="Email"
        onChangeText={(text) => {
          setEmail(text);
          setEmailError('');
        }}
        keyboardType="email-address"
      />
      {emailError !== '' && <Text style={styles.errorText}>{emailError}</Text>}
      <TextInput style={styles.input} placeholder="Login" onChangeText={setLogin} />
      <TextInput style={styles.input} placeholder="Mot de passe" onChangeText={setMotDePasse} secureTextEntry />
      <TextInput style={styles.input} placeholder="Téléphone" onChangeText={setTelephone} keyboardType="phone-pad" />
      <TextInput style={styles.input} placeholder="Adresse" onChangeText={setAdresse} />

      <Text style={styles.label}>Ville</Text>
      <TouchableOpacity style={styles.dropdownToggle} onPress={() => { setCurrentDropdown('ville'); setModalVisible(true); }}>
        <Text style={styles.dropdownToggleText}>{ville || 'Choisir une ville'}</Text>
      </TouchableOpacity>

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

      <TextInput style={styles.input} placeholder="Nom de l’établissement" onChangeText={setNomEtablissement} />
      <TextInput style={styles.input} placeholder="Catégorie" onChangeText={setCategorie} />
      <TextInput style={styles.input} placeholder="Registre de commerce" onChangeText={setRegistreCommerce} />
      <TextInput style={styles.input} placeholder="Identifiant fiscal" onChangeText={setIdentifiantFiscal} />
      <TextInput style={styles.input} placeholder="RIB (optionnel)" onChangeText={setRib} />

      <Text style={styles.label}>Pièces justificatives</Text>
      <Button title="Choisir fichier RC" onPress={() => handlePickDocument('RC')} />
      <Button title="Choisir fichier CNSS" onPress={() => handlePickDocument('CNSS')} />

      {piecesJointes.length > 0 && (
        <View style={{ marginTop: 10 }}>
          {piecesJointes.map((pj, idx) => (
            <Text key={idx} style={{ fontSize: 14 }}>
              📎 {pj.typeFichier}: {pj.fichier.name}
            </Text>
          ))}
        </View>
      )}

      <View style={styles.buttonContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#1E90FF" />
        ) : (
          <Button title="Soumettre" onPress={handleSubmit} color="#1E90FF" />
        )}
      </View>

      {/* Dropdown Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalContainer}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <FlatList
                  data={
                    currentDropdown === 'ville' ? villes :
                    currentDropdown === 'jour' ? jours : heures
                  }
                  renderItem={({ item }) => (
                    <TouchableOpacity style={styles.modalItem} onPress={() => handleDropdownSelect(item)}>
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
  container: { padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 15,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  label: { fontSize: 16, marginBottom: 5, color: '#555' },
  dropdownToggle: {
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 15,
  },
  dropdownToggleText: { fontSize: 16, color: '#333' },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    width: '80%',
    maxHeight: '50%',
  },
  modalItem: { padding: 12, borderBottomWidth: 1, borderColor: '#ccc' },
  modalItemText: { fontSize: 16 },
  buttonContainer: { marginTop: 10 },
  errorText: {
    color: 'red',
    marginBottom: 10,
    marginLeft: 4,
    fontSize: 14,
  },
});
