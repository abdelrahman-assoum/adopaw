import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";
import { loadNamespace } from "../utils/loadNamespace";

export const useTranslationLoader = (namespaces) => {
  const [ready, setReady] = useState(false);
  const lang = i18n.language;

  const nsArray = Array.isArray(namespaces) ? namespaces : [namespaces];

  const { t } = useTranslation(nsArray);

  useEffect(() => {
    let isMounted = true;

    Promise.all(nsArray.map((ns) => loadNamespace(ns, lang))).then(() => {
      if (isMounted) {
        setReady(true);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [lang, namespaces]);

  return { t, ready };
};
