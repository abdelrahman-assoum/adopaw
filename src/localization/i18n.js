import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Updates from "expo-updates";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { I18nManager } from "react-native";
import translationRegistry from "./utils/translationRegistry";

const LANGUAGE_PREFERENCE_KEY = "user-language";

// 👇 Define which languages are RTL
const RTL_LANGUAGES = ["ar", "he", "fa", "ur"]; // Add more if needed

// Derive namespace list from whatever is registered — grows automatically
// as you add more namespaces to translationRegistry.js
const namespaces = Object.keys(translationRegistry.en);

i18n.use(initReactI18next).init({
  fallbackLng: "en",
  lng: "en",
  resources: translationRegistry, // all translations available immediately, no backend needed
  ns: namespaces,
  defaultNS: namespaces[0] ?? "common",
  interpolation: { escapeValue: false },
});

// Helper function to set up RTL
const setupRTL = async (lng, forceReload = true, prev) => {
  const isRTL = RTL_LANGUAGES.includes(lng);

  console.log("Setting up RTL for language:", lng, "isRTL:", isRTL);
  console.log("Current I18nManager.isRTL:", I18nManager.isRTL);

  if (I18nManager.isRTL !== isRTL) {
    I18nManager.allowRTL(isRTL);
    I18nManager.forceRTL(isRTL);

    if (forceReload) {
      // Small delay to persist changes
      setTimeout(() => {
        Updates.reloadAsync();
      }, 300);
    }
  }
  if (RTL_LANGUAGES.includes(prev)) {
    I18nManager.allowRTL(isRTL);
    I18nManager.forceRTL(isRTL);

    if (forceReload) {
      // Small delay to persist changes
      setTimeout(() => {
        Updates.reloadAsync();
      }, 300);
    }
  }
};

export const setLanguage = async (lng) => {
  try {
    // Save language
    await AsyncStorage.setItem(LANGUAGE_PREFERENCE_KEY, lng);
    const prev = i18n.language;
    // Change i18n language
    if (prev === lng) return;
    await i18n.changeLanguage(lng);

    // Set up RTL
    await setupRTL(lng, true, prev);

    console.log("Language set to:", lng);
  } catch (error) {
    console.error("Error setting language:", error);
  }
};

export const initializeLanguageAndRTL = async () => {
  try {
    const storedLang = await AsyncStorage.getItem(LANGUAGE_PREFERENCE_KEY);
    if (storedLang) {
      await i18n.changeLanguage(storedLang);
      await setupRTL(storedLang, false); // Don't force reload during initialization
    }
    return storedLang;
  } catch (error) {
    console.error("Error initializing language and RTL:", error);
    return null;
  }
};

export const getStoredLanguage = async () => {
  try {
    const storedLang = await AsyncStorage.getItem(LANGUAGE_PREFERENCE_KEY);
    return storedLang || null;
  } catch (error) {
    console.error("Error getting stored language:", error);
    return null;
  }
};

export const isRTL = (lng) => {
  return RTL_LANGUAGES.includes(lng);
};

export default i18n;
