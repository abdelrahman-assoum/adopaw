import React from "react";
import {
  I18nManager,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Snackbar, Text, useTheme } from "react-native-paper";
import { useTranslationLoader } from "../../../../localization/hooks/useTranslationLoader";
import i18n from "../../../../localization/i18n";

export default function AppSnackbar({
  visible,
  message,
  onDismiss,
  duration = 3000,
  actionLabel,
}) {
  const { colors } = useTheme();
  const { t } = useTranslationLoader("common");

  const currentLang = i18n.language;
  const isRTL = currentLang === "ar" || I18nManager.isRTL;

  const label = actionLabel || t("snackbar.ok");

  return (
    <Snackbar
      visible={visible}
      onDismiss={onDismiss}
      duration={duration}
      style={[styles.snackbar]}
    >
      <View style={[styles.content]}>
        <Text style={[styles.message, { color: colors.surface }]}>
          {message}
        </Text>

        <TouchableOpacity onPress={onDismiss} style={styles.actionButton}>
          <Text style={[styles.actionLabel, { color: colors.primary }]}>
            {label}
          </Text>
        </TouchableOpacity>
      </View>
    </Snackbar>
  );
}

const styles = StyleSheet.create({
  snackbar: {
    width: "100%",
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
    borderRadius: 8,
    elevation: 4,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  message: {
    flex: 1,
    fontSize: 14,
  },
  actionButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  actionLabel: {
    fontWeight: "bold",
    fontSize: 14,
  },

});
