import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { RadioButton, Surface, Text, useTheme } from "react-native-paper";

import { setLanguage } from "@/src/localization/i18n";
import { useTranslationLoader } from "@/src/localization/hooks/useTranslationLoader";
import ScreenLayout from "@/src/shared/layout/ScreenLayout/ScreenLayout";
import { languagesOptions } from "@/src/shared/constants/languages";

export default function UserLanguageScreen() {
  const { t } = useTranslationLoader("profile");
  const { colors } = useTheme();
  const [selected, setSelected] = useState("en");

  useEffect(() => {
    AsyncStorage.getItem("user-language").then((lang) => {
      if (lang) setSelected(lang);
    });
  }, []);

  const handleSelect = async (value) => {
    if (selected === value) return;
    setSelected(value);
    await setLanguage(value);
  };

  return (
    <ScreenLayout title={t("appearance.language.label")}>
      <View style={{ paddingHorizontal: 20, gap: 12 }}>
        {languagesOptions.map((option) => {
          const isSelected = selected === option.value;
          return (
            <TouchableOpacity
              key={option.value}
              onPress={() => handleSelect(option.value)}
              activeOpacity={0.85}
              style={{ marginVertical: 2, width: "100%" }}
            >
              <Surface
                elevation={0}
                style={[
                  styles.option,
                  {
                    backgroundColor: isSelected
                      ? (colors.palette?.blue?.[100] ?? "#D0E8FF")
                      : colors.surface,
                    borderWidth: 1,
                    borderColor: isSelected
                      ? (colors.palette?.blue?.[500] ?? "#007BFF")
                      : (colors.palette?.neutral?.[200] ?? "#DDDDDD"),
                  },
                ]}
              >
                <View style={styles.row}>
                  <Image source={option.image} style={styles.flag} resizeMode="contain" />
                  <Text style={[styles.label, { color: isSelected ? colors.primary : colors.onSurface }]}>
                    {option.label}
                  </Text>
                </View>
                <RadioButton
                  value={option.value}
                  status={isSelected ? "checked" : "unchecked"}
                  onPress={() => handleSelect(option.value)}
                />
              </Surface>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
    gap: 10,
  },
  flag: {
    width: 26,
    height: 26,
  },
  label: {
    fontSize: 16,
    fontFamily: "Alexandria_400Regular",
  },
});
