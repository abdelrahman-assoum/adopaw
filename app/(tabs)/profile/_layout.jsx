import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { I18nManager, TouchableOpacity } from "react-native";
import { useTheme } from "react-native-paper";

import { useTranslationLoader } from "@/src/localization/hooks/useTranslationLoader";

export default function ProfileLayout() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslationLoader("chatId");

  const backIcon = (
    <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 15, padding: 5 }}>
      <Ionicons
        name={I18nManager.isRTL ? "arrow-forward" : "arrow-back"}
        size={24}
        color={theme.colors.onSurface}
      />
    </TouchableOpacity>
  );

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="user-profile" />
      <Stack.Screen name="user-pets" />
      <Stack.Screen name="user-pet-preferences" />
      <Stack.Screen name="appearance" />
      <Stack.Screen name="user-theme" />
      <Stack.Screen name="user-language" />
      <Stack.Screen name="help" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="requests" />
      <Stack.Screen name="[petId]" options={{ animation: "slide_from_right" }} />
      <Stack.Screen
        name="chat"
        options={({ route }) => ({
          headerShown: true,
          headerStyle: { backgroundColor: theme.colors.surface },
          headerTintColor: theme.colors.onSurface,
          headerTitleStyle: { fontFamily: "Alexandria_700Bold" },
          title: route.params?.title ?? t("chatTitle"),
          animation: "slide_from_right",
          headerLeft: () => backIcon,
        })}
      />
    </Stack>
  );
}
