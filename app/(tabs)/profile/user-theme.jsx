import { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { RadioButton, Surface, Text, useTheme } from "react-native-paper";

import { useThemeContext } from "@/src/context/ThemeContext";
import { useTranslationLoader } from "@/src/localization/hooks/useTranslationLoader";
import ScreenLayout from "@/src/shared/layout/ScreenLayout/ScreenLayout";

const THEME_OPTIONS = ["system", "light", "dark"];

export default function UserThemeScreen() {
  const { themePreference, updateTheme } = useThemeContext();
  const { colors } = useTheme();
  const { t } = useTranslationLoader("profile");
  const [selected, setSelected] = useState(themePreference);

  useEffect(() => {
    setSelected(themePreference);
  }, [themePreference]);

  const handleSelect = (value) => {
    setSelected(value);
    updateTheme(value);
  };

  return (
    <ScreenLayout title={t("appearance.theme.label")}>
      <View style={{ paddingHorizontal: 20, gap: 12 }}>
        {THEME_OPTIONS.map((value) => {
          const isSelected = selected === value;
          return (
            <TouchableOpacity
              key={value}
              onPress={() => handleSelect(value)}
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
                      : (colors.palette?.neutral?.[500] ?? "#AAAAAA"),
                  },
                ]}
              >
                <Text style={[styles.label, { color: isSelected ? colors.primary : colors.text }]}>
                  {t(`appearance.theme.options.${value}`)}
                </Text>
                <RadioButton
                  value={value}
                  status={isSelected ? "checked" : "unchecked"}
                  onPress={() => handleSelect(value)}
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
  label: {
    fontSize: 16,
    fontFamily: "Alexandria_400Regular",
  },
});
