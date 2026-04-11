// src/shared/components/ui/CustomSelect/ColorSelectOption.js

import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Text, useTheme } from "react-native-paper";

export default function ColorSelectOption({
  color,
  label,
  selected,
  onPress,
  size = 48, // diameter of the circle
  style,
}) {
  const { colors } = useTheme();

  const borderColor = selected
    ? (colors?.palette?.blue?.[500] ?? "#007BFF")
    : "#B2B2B2";

  return (
    <TouchableOpacity onPress={onPress} style={[styles.container, style]}>
      <View
        style={[
          styles.circle,
          {
            backgroundColor: color,
            width: size,
            height: size,
            borderColor,
            borderWidth: 2,
          },
        ]}
      />
      <Text
        style={[
          styles.label,
          { color: selected ? colors.primary : colors.onSurface },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    margin: 4,
  },
  circle: {
    borderRadius: 100, // ensure perfect circle
  },
  label: {
    fontSize: 14,
    marginTop: 4,
    textAlign: "center",
  },
});
