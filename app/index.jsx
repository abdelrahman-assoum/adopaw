import { Image } from "expo-image";
import { useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";

import { useThemeContext } from "@/src/context/ThemeContext";
import { useLoadFonts } from "@/src/fonts/alexandria";
import { getCurrentSession } from "@/src/shared/services/supabase/auth";
import { CustomDarkTheme, CustomLightTheme } from "@/src/theme";

// Keep the native splash visible until we're ready to route
SplashScreen.preventAutoHideAsync();

export default function BootScreen() {
  const router = useRouter();
  const fontsLoaded = useLoadFonts();
  const didRun = useRef(false);
  const { resolvedTheme } = useThemeContext();

  const bg =
    resolvedTheme === "dark"
      ? CustomDarkTheme.colors.background
      : CustomLightTheme.colors.background;

  useEffect(() => {
    if (!fontsLoaded || didRun.current) return;
    didRun.current = true;

    // Fonts are ready — hide native splash, show our branded screen briefly
    SplashScreen.hideAsync();
    boot();
  }, [fontsLoaded]);

  async function boot() {
    try {
      // const launched = await AsyncStorage.getItem(STORAGE_KEYS.ALREADY_LAUNCHED);
      const launched = false;
      if (!launched) {
        router.replace("/(onboarding)");
        return;
      }

      const session = await getCurrentSession();
      if (!session?.access_token) {
        router.replace("/login");
        return;
      }

      router.replace("/(tabs)/home");
    } catch {
      router.replace("/login");
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <Image
        source={require("../src/assets/images/logo-tp.png")}
        style={styles.logo}
        contentFit="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 160,
    height: 160,
  },
});
