import { Ionicons } from "@expo/vector-icons";
import { I18nManager as RNI18nManager, StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";

export default function InfoCard({
  visible,
  message,
  type = "error",
  onDismiss,
}) {
  const isRTL = RNI18nManager.isRTL;
  const { colors } = useTheme();

  if (!visible || !message) return null;

  const isError = type === "error";
  const backgroundColor = isError
    ? colors.errorContainer
    : colors.secondaryContainer;
  const textColor = isError
    ? colors.onErrorContainer
    : colors.onSecondaryContainer;
  const iconName = isError ? "alert-circle" : "warning";
  const iconColor = isError ? colors.error : colors.secondary;

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Ionicons
        name={iconName}
        size={20}
        color={iconColor}
        style={styles.icon}
      />
      <Text
        style={[
          styles.message,
          { color: textColor, textAlign: isRTL ? "right" : "left" },
        ]}
      >
        {message}
      </Text>
      <Ionicons
        name="close"
        size={20}
        color={textColor}
        style={styles.closeIcon}
        onPress={onDismiss}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 0,
    marginBottom: 16,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  icon: {
    marginRight: 12,
  },
  message: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  closeIcon: {
    marginLeft: 12,
  },
});
