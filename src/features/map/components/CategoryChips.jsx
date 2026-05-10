import { ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { Text, useTheme } from "react-native-paper";

import { useTranslationLoader } from "@/src/localization/hooks/useTranslationLoader";
import { CATEGORIES, CATEGORY_CONFIG } from "../data/places";

export default function CategoryChips({ selected, onSelect }) {
  const { t } = useTranslationLoader("map");
  const theme = useTheme();
  const { palette } = theme.colors;

  const inactiveBg     = theme.colors.surface;
  const inactiveBorder = theme.dark ? "rgba(255,255,255,0.1)" : palette.neutral[300];
  const inactiveText   = theme.dark ? palette.neutral[400] : palette.neutral[600];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {CATEGORIES.map((cat) => {
        const config = CATEGORY_CONFIG[cat];
        const isSelected = selected === cat;

        // 13% opacity tint of the category color — same pattern as blue[100] used elsewhere
        const activeBg = config.color + "22";

        return (
          <TouchableOpacity
            key={cat}
            activeOpacity={0.7}
            onPress={() => onSelect(isSelected ? null : cat)}
            style={[
              styles.chip,
              isSelected
                ? {
                    backgroundColor: activeBg,
                    borderColor: config.color,
                    borderWidth: 1.5,
                    shadowOpacity: 0,
                    elevation: 0,
                  }
                : {
                    backgroundColor: inactiveBg,
                    borderColor: inactiveBorder,
                    borderWidth: 1,
                  },
            ]}
          >
            <Text style={styles.emoji}>{config.emoji}</Text>
            <Text
              style={[
                styles.label,
                {
                  color: isSelected ? config.color : inactiveText,
                  fontFamily: isSelected
                    ? "Alexandria_600SemiBold"
                    : "Alexandria_400Regular",
                },
              ]}
            >
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
    paddingVertical: 2,
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 3,
    elevation: 2,
  },
  emoji: {
    fontSize: 14,
  },
  label: {
    fontSize: 12,
  },
});
