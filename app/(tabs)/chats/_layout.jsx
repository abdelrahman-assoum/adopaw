import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { I18nManager, TouchableOpacity } from "react-native";
import { useTheme } from "react-native-paper";

import { useTranslationLoader } from "@/src/localization/hooks/useTranslationLoader";

export default function ChatsLayout() {
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
    <Stack
      screenOptions={{
        headerShown: false,
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.onSurface,
        headerTitleStyle: { fontFamily: "Alexandria_700Bold" },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="[chatId]"
        options={({ route }) => ({
          headerShown: true,
          title: route.params?.title ?? t("chatTitle"),
          animation: "slide_from_right",
          headerLeft: () => backIcon,
        })}
      />
      <Stack.Screen
        name="pawlo"
        options={{
          headerShown: true,
          title: t("pawloTitle"),
          animation: "slide_from_right",
          headerLeft: () => backIcon,
        }}
      />
    </Stack>
  );
}
