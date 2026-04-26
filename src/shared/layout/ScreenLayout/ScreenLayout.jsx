import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { I18nManager, StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import i18n from "@/src/localization/i18n";

export default function ScreenLayout({ title, children }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const isRTL = I18nManager.isRTL || i18n.language === "ar";

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingBottom: insets.bottom,
          paddingTop: insets.top + 12,
        },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons
            name={isRTL ? "arrow-forward" : "arrow-back"}
            size={32}
            color={colors.onSurface}
            onPress={() => router.back()}
          />
          <Text variant="headlineLarge" style={{ color: colors.text }}>
            {title}
          </Text>
        </View>
      </View>

      <View style={{ flex: 1 }}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
});
