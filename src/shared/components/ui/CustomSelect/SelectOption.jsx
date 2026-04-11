// src/shared/components/SelectOption.js

import { Ionicons } from "@expo/vector-icons";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { Surface, Text, useTheme } from "react-native-paper";

export default function SelectOption({
  label,
  image,
  selected,
  onPress,
  icon,
  iconColor,
  style
}) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity onPress={onPress} style={{ marginVertical: 4 }}>
      <Surface
        elevation={0}
        style={[
          styles.optionContainer,
          {
            backgroundColor: selected
              ? (colors?.palette?.blue?.[100] ?? "#D0E8FF")
              : colors.surface,
            borderWidth: 1,
            borderColor: selected
              ? (colors?.palette?.blue?.[500] ?? "#007BFF")
              : (colors?.palette?.neutral?.[300] ?? "#CCCCCC"),
          },
          style,
        ]}
      >
        <View style={styles.contentRow}>
          {image && (
            <Image
              source={image}
              style={{ width: 24, height: 24 }}
              resizeMode="contain"
            />
          )}
          {icon && (
            <Ionicons
              name={icon}
              size={24}
              color={
                iconColor ?? (selected ? colors.primary : colors.onSurface)
              }
            />
          )}
          <Text
            style={[
              styles.label,
              { color: selected ? colors.primary : colors.onSurface },
            ]}
          >
            {label}
          </Text>
        </View>
      </Surface>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  optionContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 16,
    width: 118,
  },
  label: {
    fontSize: 16,
  },
  contentRow: {
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    justifyContent: "center",
  },
});
