import React from "react";
import { I18nManager, StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";

export default function OrDivider() {
  const { colors } = useTheme();
  const isRTL = I18nManager.isRTL;

  return (
    <View style={styles.orContainer}>
      <View style={[styles.line, { backgroundColor: colors.placeholder }]} />
      <Text
        style={[styles.orText, { writingDirection: isRTL ? "rtl" : "ltr", color: colors.text }]}
      >
        {isRTL ? "أو" : "or"}
      </Text>
      <View style={[styles.line, { backgroundColor: colors.placeholder }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  orContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  orText: {
    marginHorizontal: 12,
    fontSize: 14,
    fontWeight: "500",
  },
  line: {
    flex: 1,
    height: StyleSheet.hairlineWidth, // or use 1 for solid line
  },
});
