import React, { createContext, useState, useEffect } from "react";
import { I18nManager, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { translations } from "./i18n";

export const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState("fr");

  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem("lang");
      if (saved) {
        setLang(saved);

        // RTL only for native platforms
        if (Platform.OS !== "web") {
          I18nManager.allowRTL(saved === "ar");
          I18nManager.forceRTL(saved === "ar");
        }
      }
    })();
  }, []);

  const changeLanguage = async (newLang) => {
    setLang(newLang);
    await AsyncStorage.setItem("lang", newLang);

    if (Platform.OS !== "web") {
      I18nManager.allowRTL(newLang === "ar");
      I18nManager.forceRTL(newLang === "ar");
    }

    // 👇 Pas besoin de reload : on applique RTL manuellement
  };

  const t = (key) => translations[lang]?.[key] || key;

  return (
    <LanguageContext.Provider value={{ lang, changeLanguage, t, translations }}>
      {children}
    </LanguageContext.Provider>
  );
}
