// src/context/ThemeContext.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme as useSystemColorScheme } from "react-native";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const systemScheme = useSystemColorScheme();
  const [themePreference, setThemePreference] = useState("system");
  const [resolvedTheme, setResolvedTheme] = useState("light");

  // Load saved preference
  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem("user-theme");
      if (saved) {
        setThemePreference(saved);
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

  const updateTheme = async (pref) => {
    setThemePreference(pref);
    await AsyncStorage.setItem("user-theme", pref);
  };

  return (
    <ThemeContext.Provider
      value={{ themePreference, resolvedTheme, updateTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  return useContext(ThemeContext);
}
