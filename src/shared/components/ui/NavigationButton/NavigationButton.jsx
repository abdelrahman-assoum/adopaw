import { Ionicons } from "@expo/vector-icons";
import { I18nManager, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text, useTheme } from "react-native-paper";

import i18n from "@/src/localization/i18n";

export default function NavigationButton({ iconName, title, trailingText, badgeCount, danger, onPress }) {
  const { colors } = useTheme();
  const isRTL = I18nManager.isRTL || i18n.language === "ar";

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.surface }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        {iconName ? (
          <Ionicons
            name={iconName}
            size={24}
            color={danger ? colors.error : colors.onSurface}
          />
        ) : null}
      </View>

      <Text style={[styles.title, { color: danger ? colors.error : colors.onSurface }]}>
        {title}
      </Text>

      {trailingText ? (
        <Text style={[styles.trailingText, { color: colors.palette.neutral[500] }]}>
          {trailingText}
        </Text>
      ) : null}

      {badgeCount > 0 ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badgeCount > 99 ? "99+" : badgeCount}</Text>
        </View>
      ) : null}

      <Ionicons
        name={isRTL ? "chevron-back" : "chevron-forward"}
        size={20}
        color={colors.palette.neutral[500]}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    width: "100%",
  },
  iconContainer: {
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Alexandria_400Regular",
  },
  trailingText: {
    marginRight: 8,
    fontSize: 14,
    fontFamily: "Alexandria_400Regular",
  },
  badge: {
    backgroundColor: "#FF6B6B",
    borderRadius: 99,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
    marginRight: 8,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontFamily: "Alexandria_600SemiBold",
    lineHeight: 14,
  },
});
