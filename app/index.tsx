import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Image,
  I18nManager,
  KeyboardAvoidingView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useRouter } from "expo-router";
import DropDownPicker from "react-native-dropdown-picker";

export default function WelcomeScreen() {
  const router = useRouter();

  // Langues
  const [lang, setLang] = useState("fr");
  const [open, setOpen] = useState(false);

const texts = {
  fr: {
    title: "Bienvenue sur l’application",
    subtitle: "Connectez-vous pour gérer vos commandes et ventes",
    create: "Créer un compte",
    login: "Se connecter",
    footer: "© 2025 — Tous droits réservés",
  },
  en: {
    title: "Welcome to the App",
    subtitle: "Login to manage your orders and sales",
    create: "Create Account",
    login: "Login",
    footer: "© 2025 — All rights reserved",
  },
  es: {
    title: "Bienvenido a la aplicación",
    subtitle: "Inicie sesión para gestionar sus pedidos y ventas",
    create: "Crear cuenta",
    login: "Iniciar sesión",
    footer: "© 2025 — Todos los derechos reservados",
  },
  ar: {
    title: "مرحبًا بكم في التطبيق",
    subtitle: "قم بتسجيل الدخول لإدارة طلباتك ومبيعاتك",
    create: "إنشاء حساب",
    login: "تسجيل الدخول",
    footer: "© ٢٠٢٥ — جميع الحقوق محفوظة",
  },
};


  const languages = [
    { label: "Français 🇫🇷", value: "fr" },
    { label: "English 🇬🇧", value: "en" },
    { label: "Español 🇪🇸", value: "es" },
    { label: "العربية 🇸🇦", value: "ar" },
  ];

  // Charger la langue sauvegardée
  useEffect(() => {
    (async () => {
      const savedLang = await AsyncStorage.getItem("lang");
      if (savedLang) changeLanguage(savedLang);
    })();
  }, []);

  // Changement de langue + RTL pour arabe
  const changeLanguage = async (newLang) => {
    setLang(newLang);
    await AsyncStorage.setItem("lang", newLang);
    I18nManager.forceRTL(newLang === "ar");
  };

  return (
    <>
      {/* Supprime le header Expo Router */}
      <Stack.Screen options={{ headerShown: false }} />

      <ImageBackground
        source={{
          uri: "https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80&w=2070",
        }}
        style={styles.background}
        resizeMode="cover"
      >
        <KeyboardAvoidingView behavior="padding" style={styles.container}>
          {/* Sélecteur de langue flottant */}
          <View style={styles.langDropdownWrapper}>
            <DropDownPicker
              open={open}
              value={lang}
              items={languages}
              setOpen={setOpen}
              setValue={setLang}
              onChangeValue={changeLanguage}
              style={styles.dropdown}
              textStyle={styles.dropdownText}
              dropDownContainerStyle={styles.dropdownContainer}
            />
          </View>

          <View style={[styles.card, lang === "ar" && { direction: "rtl" }]}>
            <Image
              source={{
                uri: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
              }}
              style={styles.logo}
            />
            <Text style={styles.title}>{texts[lang].title}</Text>
            <Text style={styles.subtitle}>{texts[lang].subtitle}</Text>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: "#2563eb" }]}
              onPress={() => router.push("/signup")}
            >
              <Text style={styles.buttonText}>{texts[lang].create}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: "#16a34a" }]}
              onPress={() => router.push("/login")}
            >
              <Text style={styles.buttonText}>{texts[lang].login}</Text>
            </TouchableOpacity>

            <Text style={styles.footer}>{texts[lang].footer}</Text>
          </View>
        </KeyboardAvoidingView>
      </ImageBackground>
    </>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, justifyContent: "center" },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  card: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "rgba(30, 41, 59, 0.85)",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 10,
  },
  logo: { width: 80, height: 80, marginBottom: 15 },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#f8fafc",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
    marginBottom: 30,
  },
  button: {
    width: "100%",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginVertical: 8,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  footer: {
    marginTop: 25,
    fontSize: 12,
    color: "#94a3b8",
    textAlign: "center",
  },
  langDropdownWrapper: {
    position: "absolute",
    top: 40,
    right: 20,
    width: 150,
    zIndex: 1000,
  },
  dropdown: { backgroundColor: "rgba(255,255,255,0.1)" },
  dropdownText: { color: "#f1f5f9" },
  dropdownContainer: { backgroundColor: "rgba(30,41,59,0.9)" },
});
