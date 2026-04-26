import { View } from "react-native";
import { Text, useTheme } from "react-native-paper";

import { useTranslationLoader } from "@/src/localization/hooks/useTranslationLoader";
import ScreenLayout from "@/src/shared/layout/ScreenLayout/ScreenLayout";

export default function NotificationsScreen() {
  const { t } = useTranslationLoader("profile");
  const { colors } = useTheme();

  return (
    <ScreenLayout title={t("notifications.title")}>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 32 }}>
        <Text variant="bodyLarge" style={{ color: colors.palette.neutral[500], textAlign: "center" }}>
          {t("notifications.comingSoon")}
        </Text>
      </View>
    </ScreenLayout>
  );
}
