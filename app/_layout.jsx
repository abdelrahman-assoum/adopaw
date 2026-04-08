import { Slot } from "expo-router";
import { I18nextProvider } from "react-i18next";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";

import i18n, { initializeLanguageAndRTL } from "@/src/localization/i18n";
import { ThemeProvider, useThemeContext } from "@/src/context/ThemeContext";
import { CustomDarkTheme, CustomLightTheme } from "@/src/theme";

const queryClient = new QueryClient();

export default function RootLayout() {
  useEffect(() => {
    initializeLanguageAndRTL();
  }, []);

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
  return (
    <PaperProvider theme={theme}>
      <Slot />
    </PaperProvider>
  );
}
