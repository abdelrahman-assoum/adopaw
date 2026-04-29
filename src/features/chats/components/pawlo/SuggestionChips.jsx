import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { Chip, Text, useTheme } from "react-native-paper";

export default function SuggestionChips({ suggestions, onSelect }) {
  const theme = useTheme();
  const { palette } = theme.colors;

  const items = useMemo(() => {
    if (!Array.isArray(suggestions)) return [];
    return suggestions
      .map((s) =>
        typeof s === "string"
          ? { label: s, type: "neutral" }
          : { label: String(s?.label ?? ""), type: String(s?.type ?? "neutral") }
      )
      .filter((x) => x.label.length > 0);
  }, [suggestions]);

  if (!items.length) return null;

  return (
    <View style={styles.container}>
      {items.map(({ label, type }, idx) => {
        const isBlue = type === "blue";
        const isCoral = type === "coral";
        return (
          <Chip
            key={`${label}-${idx}`}
            style={[
              styles.chip,
              {
                backgroundColor: isBlue
                  ? palette.blue[200]
                  : isCoral
                  ? palette.coral[200]
                  : theme.colors.surfaceVariant,
                borderColor: isBlue
                  ? palette.blue[300]
                  : isCoral
                  ? palette.coral[300]
                  : "transparent",
                borderWidth: 1,
              },
            ]}
            onPress={() => onSelect?.(label)}
            compact
          >
            <Text
              style={[
                styles.chipText,
                {
                  color: isBlue
                    ? palette.blue[600]
                    : isCoral
                    ? palette.coral[600]
                    : theme.colors.onSurface,
                },
              ]}
            >
              {label}
            </Text>
          </Chip>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
    marginTop: 20,
  },
  chip: { borderRadius: 50 },
  chipText: {
    fontFamily: "Alexandria_400Regular",
    fontSize: 9,
  },
});
