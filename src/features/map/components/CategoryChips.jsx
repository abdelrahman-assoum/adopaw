import { ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";
import { useTheme } from "react-native-paper";
import { CATEGORIES, CATEGORY_CONFIG } from "../data/places";
import { useTranslationLoader } from "@/src/localization/hooks/useTranslationLoader";

export default function CategoryChips({ selected, onSelect }) {
  const { t } = useTranslationLoader("map");
  const theme = useTheme();

  const chipBg     = theme.colors.surface;
  const chipBorder = theme.dark ? "rgba(255,255,255,0.15)" : "rgba(169,169,169,0.5)";
  const labelColor = theme.colors.onSurface;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {CATEGORIES.map((cat) => {
        const config = CATEGORY_CONFIG[cat];
        const isSelected = selected === cat;
        return (
          <TouchableOpacity
            key={cat}
            activeOpacity={0.75}
            style={[
              styles.chip,
              { backgroundColor: chipBg, borderColor: chipBorder },
              isSelected && { backgroundColor: config.color, borderColor: config.color },
            ]}
            onPress={() => onSelect(isSelected ? null : cat)}
          >
            <Text style={styles.chipEmoji}>{config.emoji}</Text>
            <Text style={[
              styles.chipLabel,
              { color: isSelected ? "#fff" : labelColor },
              isSelected && styles.chipLabelSelected,
            ]}>
              {t(`categories.${cat}`, config.label)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipEmoji: { fontSize: 16 },
  chipLabel: {
    fontFamily: "Alexandria_400Regular",
    fontSize: 12,
  },
  chipLabelSelected: {
    fontFamily: "Alexandria_600SemiBold",
  },
});
