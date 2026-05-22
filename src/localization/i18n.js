import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Updates from "expo-updates";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { I18nManager } from "react-native";
import translationRegistry from "./utils/translationRegistry";

const LANGUAGE_PREFERENCE_KEY = "user-language";
const RTL_LANGUAGES = ["ar", "he", "fa", "ur"];
const namespaces = Object.keys(translationRegistry.en);

i18n.use(initReactI18next).init({
  fallbackLng: "en",
  lng: "en",
  resources: translationRegistry,
  ns: namespaces,
  defaultNS: namespaces[0] ?? "common",
  interpolation: { escapeValue: false },
});

const applyRTL = (lng) => {
  const shouldBeRTL = RTL_LANGUAGES.includes(lng);
  I18nManager.allowRTL(shouldBeRTL);
  I18nManager.forceRTL(shouldBeRTL);
};

export const setLanguage = async (lng) => {
  try {
    await AsyncStorage.setItem(LANGUAGE_PREFERENCE_KEY, lng);
    if (i18n.language === lng) return;
    applyRTL(lng);
    await i18n.changeLanguage(lng);
    try {
      await Updates.reloadAsync();
    } catch {
      // Dev builds: reloadAsync unavailable
    }
  } catch (error) {
    console.error("Error setting language:", error);
  }
};

export const initializeLanguageAndRTL = async () => {
  try {
    const storedLang = await AsyncStorage.getItem(LANGUAGE_PREFERENCE_KEY);
    if (storedLang) {
      applyRTL(storedLang);
      await i18n.changeLanguage(storedLang);
    }
    return storedLang;
  } catch (error) {
    console.error("Error initializing language and RTL:", error);
    return null;
  }
};

export const getStoredLanguage = async () => {
  try {
    return (await AsyncStorage.getItem(LANGUAGE_PREFERENCE_KEY)) || null;
  } catch (error) {
    console.error("Error getting stored language:", error);
    return null;
  }
};

export const isRTL = (lng) => RTL_LANGUAGES.includes(lng);

export default i18n;
