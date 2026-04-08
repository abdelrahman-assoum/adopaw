import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

import { STORAGE_KEYS } from "@/src/shared/constants/storageKeys";
import { useLoadFonts } from "@/src/fonts/alexandria";
import { getCurrentSession } from "@/src/shared/services/supabase/auth";

export default function BootScreen() {
  const router = useRouter();
  const fontsLoaded = useLoadFonts();
  const didRun = useRef(false);

  useEffect(() => {
    if (!fontsLoaded || didRun.current) return;
    didRun.current = true;
    boot();
  }, [fontsLoaded]);

  async function boot() {
    try {
      const launched = await AsyncStorage.getItem(
        STORAGE_KEYS.ALREADY_LAUNCHED,
      );
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
    <View style={styles.container}>
      <ActivityIndicator size="large" />
      <Text style={styles.text}>Loading...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  text: { opacity: 0.5 },
});
