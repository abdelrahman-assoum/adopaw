import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";

import { useThemeContext } from "@/src/context/ThemeContext";
import { useTranslationLoader } from "@/src/localization/hooks/useTranslationLoader";
import NavigationButton from "@/src/shared/components/ui/NavigationButton/NavigationButton";
import ScreenLayout from "@/src/shared/layout/ScreenLayout/ScreenLayout";

export default function AppearanceScreen() {
  const { t } = useTranslationLoader("profile");
  const { themePreference } = useThemeContext();
  const router = useRouter();
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    AsyncStorage.getItem("user-language").then((lang) => {
      if (lang) setLanguage(lang);
    });
  }, []);

  return (
    <ScreenLayout title={t("appearance.title")}>
      <View style={{ paddingHorizontal: 20, gap: 12 }}>
        <NavigationButton
          iconName="color-palette-outline"
          title={t("appearance.theme.label")}
          trailingText={t(`appearance.theme.options.${themePreference}`)}
          onPress={() => router.push("/(tabs)/profile/user-theme")}
        />
        <NavigationButton
          iconName="globe-outline"
          title={t("appearance.language.label")}
          trailingText={t(`appearance.language.options.${language}`)}
          onPress={() => router.push("/(tabs)/profile/user-language")}
        />
      </View>
    </ScreenLayout>
  );
}
