import { useColorScheme as useSystemColorScheme } from "react-native";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type ThemePreference = "system" | "light" | "dark";

export function useAppTheme() {
  const systemScheme = useSystemColorScheme();
  const [themePreference, setThemePreference] =
    useState<ThemePreference>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem("user-theme");
      if (saved) {
        setThemePreference(saved as ThemePreference);
      }
    })();
  }, []);

  useEffect(() => {
    if (themePreference === "system") {
      setResolvedTheme(systemScheme === "dark" ? "dark" : "light");
    } else {
      setResolvedTheme(themePreference);
    }
  }, [themePreference, systemScheme]);

  const updateTheme = async (pref: ThemePreference) => {
    setThemePreference(pref);
    await AsyncStorage.setItem("user-theme", pref);
  };

  return { themePreference, resolvedTheme, updateTheme };
}
