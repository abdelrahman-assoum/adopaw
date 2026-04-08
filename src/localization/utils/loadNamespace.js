import i18n from "i18next";
import translationRegistry from "./translationRegistry";

export const loadNamespace = async (feature, lang) => {
  try {
      const translations = translationRegistry[lang]?.[feature];

      if (!translations) {
        console.warn(`No translation found for ${lang}/${feature}`);
        return;
      }
    const alreadyLoaded = i18n.hasResourceBundle(lang, feature);

    if (!alreadyLoaded) {
      i18n.addResourceBundle(
        lang,
        feature,
        translations.default || translations,
        true,
        true
      );
    }

    if (!i18n.hasLoadedNamespace(feature)) {
      await i18n.loadNamespaces(feature);
    }
  } catch (error) {
    console.warn(`Could not load translation: ${lang}/${feature}`, error);
  }
};
