import { Slot } from "expo-router";
import { I18nextProvider } from "react-i18next";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { I18nManager, View } from "react-native";

import i18n, { initializeLanguageAndRTL } from "@/src/localization/i18n";
import { ThemeProvider, useThemeContext } from "@/src/context/ThemeContext";
import { CustomDarkTheme, CustomLightTheme } from "@/src/theme";

const queryClient = new QueryClient();

export default function RootLayout() {
  const [langReady, setLangReady] = useState(false);

  useEffect(() => {
    initializeLanguageAndRTL().finally(() => setLangReady(true));
  }, []);

  if (!langReady) return null;

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <I18nextProvider i18n={i18n}>
          <ThemeProvider>
            <AppShell />
          </ThemeProvider>
        </I18nextProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

function AppShell() {
  const { resolvedTheme } = useThemeContext();
  const theme = resolvedTheme === "dark" ? CustomDarkTheme : CustomLightTheme;
  // I18nManager.isRTL is always correct here: on fresh start it's read from
  // native, and RTL direction changes trigger Updates.reloadAsync() which
  // remounts from scratch with the updated flag.
  return (
    <PaperProvider theme={theme}>
      <View style={{ flex: 1, direction: I18nManager.isRTL ? "rtl" : "ltr" }}>
        <Slot />
      </View>
    </PaperProvider>
  );
}
