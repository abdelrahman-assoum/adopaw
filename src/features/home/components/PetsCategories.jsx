import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text, useTheme } from "react-native-paper";

import { useTranslationLoader } from "@/src/localization/hooks/useTranslationLoader";

const categories = [
  { key: "cat",     icon: require("@/src/assets/images/animal/cat.png") },
  { key: "dog",     icon: require("@/src/assets/images/animal/dog.png") },
  { key: "rabbit",  icon: require("@/src/assets/images/animal/rabbit.png") },
  { key: "fish",    icon: require("@/src/assets/images/animal/fish.png") },
  { key: "bird",    icon: require("@/src/assets/images/animal/bird.png") },
  { key: "hamster", icon: require("@/src/assets/images/animal/hamster.png") },
];

export default function PetsCategories({ selected, onSelect, style, multi = false }) {
  const theme = useTheme();
  const { t } = useTranslationLoader("home");

  const blue = theme.colors.palette.blue;
  const neutral = theme.colors.palette.neutral;
  const radius = theme.custom?.radii?.lg ?? 16;

  const handlePress = (key) => {
    if (multi) {
      const arr = Array.isArray(selected) ? selected : [];
      onSelect(arr.includes(key) ? arr.filter((k) => k !== key) : [...arr, key]);
    } else {
      onSelect(selected === key ? null : key);
    }
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.scrollContainer, style]}
    >
      {categories.map((cat, idx) => {
        const isSelected = multi
          ? (Array.isArray(selected) ? selected.includes(cat.key) : false)
          : selected === cat.key;
        return (
          <TouchableOpacity
            key={cat.key}
            activeOpacity={0.85}
            onPress={() => handlePress(cat.key)}
            style={[
              styles.item,
              {
                borderRadius: radius,
                borderColor: isSelected ? blue[500] : neutral[300],
                backgroundColor: isSelected ? blue[100] : theme.colors.surface,
                marginRight: idx === categories.length - 1 ? 0 : 10,
              },
            ]}
          >
            <View style={styles.inner}>
              <Image source={cat.icon} style={styles.icon} resizeMode="contain" />
              <Text
                numberOfLines={1}
                style={{
                  color: theme.colors.onSurface,
                  fontFamily: theme.fonts.titleSmall.fontFamily,
                  fontSize: theme.fonts.titleSmall.fontSize,
                  lineHeight: theme.fonts.titleSmall.lineHeight,
                }}
              >
                {t(`category.${cat.key}`)}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { paddingHorizontal: 4 },
  item: {
    height: 44,
    paddingHorizontal: 14,
    borderWidth: 1,
    justifyContent: "center",
  },
  inner: { flexDirection: "row", alignItems: "center" },
  icon: { width: 22, height: 22, marginRight: 8 },
});
