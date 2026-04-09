import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";
import { loadNamespace } from "../utils/loadNamespace";

export const useTranslationLoader = (namespaces) => {
  const lang = i18n.language;
  const nsArray = Array.isArray(namespaces) ? namespaces : [namespaces];
  const { t } = useTranslation(nsArray);

  useEffect(() => {
    // Resources registered in translationRegistry are already loaded via i18n.init().
    // This call is a no-op for those — it only does work for any namespace
    // added to the registry dynamically after init.
    nsArray.forEach((ns) => loadNamespace(ns, lang));
  }, [lang, namespaces]);

  return { t };
};
