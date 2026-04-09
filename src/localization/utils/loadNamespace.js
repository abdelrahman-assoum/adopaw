import i18n from "i18next";
import translationRegistry from "./translationRegistry";

// Adds a namespace's translations for a given language if not already present.
// Resources provided in i18n.init() are already loaded — this handles any
// namespace added to translationRegistry AFTER init (e.g. lazily added later).
export const loadNamespace = (feature, lang) => {
  try {
    if (i18n.hasResourceBundle(lang, feature)) return;

    const translations = translationRegistry[lang]?.[feature];
    if (!translations) {
      console.warn(`No translation found for ${lang}/${feature}`);
      return;
    }

    i18n.addResourceBundle(lang, feature, translations, true, true);
  } catch (error) {
    console.warn(`Could not load translation: ${lang}/${feature}`, error);
  }
};
