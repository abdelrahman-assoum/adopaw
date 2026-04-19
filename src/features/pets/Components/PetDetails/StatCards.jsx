import { StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";

import { useTranslationLoader } from "@/src/localization/hooks/useTranslationLoader";

export default function StatCards({ size, ageValue, ageUnit, activity }) {
  const theme = useTheme();
  const { t } = useTranslationLoader("petdetails");
  const palette = theme.colors.palette;

  const ageDisplay = ageValue == null || !ageUnit
    ? "—"
    : ageUnit === "months"
      ? t("month", { count: ageValue })
      : ageUnit === "years"
        ? t("ageValue_plural", { count: ageValue })
        : `${ageValue} ${ageUnit}`;

  return (
    <View style={styles.row}>
      <View style={[styles.card, { backgroundColor: palette.blue[100] }]}>
        <Text variant="labelSmall" style={[styles.label, { color: palette.blue[500] }]}>
          {t("size")}
        </Text>
        <Text variant="labelLarge" style={[styles.value, { color: palette.blue[600] }]}>
          {t(size?.toLowerCase())}
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: palette.blue[100] }]}>
        <Text variant="labelSmall" style={[styles.label, { color: palette.blue[500] }]}>
          {t("ageText")}
        </Text>
        <Text variant="labelLarge" style={[styles.value, { color: palette.blue[600] }]}>
          {ageDisplay}
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: palette.blue[100] }]}>
        <Text variant="labelSmall" style={[styles.label, { color: palette.blue[500] }]}>
          {t("activity")}
        </Text>
        <Text variant="labelLarge" style={[styles.value, { color: palette.blue[600] }]}>
          {t(activity?.toLowerCase())}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    gap: 12,
  },
  card: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  label: { marginBottom: 4 },
  value: { fontWeight: "600" },
});
