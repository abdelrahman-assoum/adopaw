import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import * as Updates from "expo-updates";
import { useState } from "react";
import {
  I18nManager,
  Image,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { RadioButton, Surface, Text, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { setLanguage } from "../src/localization/i18n";
import AppButton from "../src/shared/components/ui/AppButton/AppButton";
import { languagesOption } from "../src/shared/constants/languages";
export default function SelectLanguage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const changeLang = async (lang) => {
    await setLanguage(lang);
    await AsyncStorage.setItem("user-language", lang);
    await AsyncStorage.setItem("firstLaunch", "false");

    const isRTL = lang === "ar";
    const rtlApplied = await AsyncStorage.getItem("rtl-applied");

    if (I18nManager.isRTL !== isRTL && rtlApplied !== "true") {
      I18nManager.allowRTL(isRTL);
      I18nManager.forceRTL(isRTL);
      await AsyncStorage.setItem("rtl-applied", "true");
      await Updates.reloadAsync(); // reload just once
      return;
    }

    router.replace("/(onboarding)/step1");
  };

  const [selected, setSelected] = useState("en");

  const { colors, dark } = useTheme();
  const image = dark
    ? require("../src/assets/images/adopaw-splash2-dark.jpg")
    : require("../src/assets/images/adopaw-splash2-light.jpg");

  return (
    <ImageBackground
      source={image}
      style={styles.imageBackground}
      resizeMode="cover"
    >
      <Text style={{ textAlign: "start", padding: 16 }}>تيست</Text>

      <View
        style={[
          styles.container,
          {
            paddingBottom: insets.bottom + 12,
            paddingTop: insets.top,
            paddingHorizontal: 24,
          },
        ]}
      >
        <Text variant="titleLarge">Select Language</Text>
        {languagesOption.map((option) => {
          const isSelected = selected === option.value;

          return (
            <TouchableOpacity
              key={option.value}
              onPress={() => setSelected(option.value)}
              style={{ marginVertical: 2, width: "100%" }}
            >
              <Surface
                elevation={0}
                style={[
                  styles.optionContainer,
                  {
                    backgroundColor: isSelected
                      ? (colors?.palette?.blue?.[100] ?? "#D0E8FF")
                      : colors.surface,
                    borderWidth: 1,
                    borderColor: isSelected
                      ? (colors?.palette?.blue?.[500] ?? "#007BFF")
                      : (colors?.palette?.neutral?.[500] ?? "#AAAAAA"),
                  },
                ]}
              >
                <View style={styles.contentRow}>
                  <Image
                    source={option.image}
                    style={{ width: 24, height: 24, marginRight: 8 }}
                    resizeMode="contain"
                  />
                  <Text
                    style={[
                      styles.label,
                      { color: isSelected ? colors.primary : colors.text },
                    ]}
                  >
                    {option.label}
                  </Text>
                </View>

                <RadioButton
                  value={option.value}
                  status={isSelected ? "checked" : "unchecked"}
                  onPress={() => setSelected(option.value)}
                />
              </Surface>
            </TouchableOpacity>
          );
        })}
        <AppButton
          text={"Continue"}
          onPress={() =>
            changeLang(
              languagesOption.find((lang) => lang.value === selected)?.value,
            )
          }
        />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  imageBackground: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  container: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 16,
    padding: 32,
  },
  btn: {
    width: 200,
  },
  optionContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 16,
    elevation: 2,
    backgroundColor: "white",
  },
  selected: {
    borderColor: "#6200ee",
    borderWidth: 2,
  },
  label: {
    fontSize: 16,
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
  },
});
