import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Text, useTheme } from "react-native-paper";

import { useTranslationLoader } from "@/src/localization/hooks/useTranslationLoader";

const healthOptions = [
  { key: "sterilized",   labelKey: "health.sterilized" },
  { key: "vaccinated",   labelKey: "health.vaccinated" },
  { key: "dewormed",     labelKey: "health.dewormed" },
  { key: "hasPassport",  labelKey: "health.hasPassport" },
  { key: "specialNeeds", labelKey: "health.specialNeeds" },
];

export default function PetHealthCheckboxes({ values, onChange }) {
  const { t } = useTranslationLoader("addPet");
  const { colors } = useTheme();

  const toggleValue = (key) => onChange({ ...values, [key]: !values[key] });

  return (
    <View style={styles.grid}>
      {healthOptions.map((opt) => {
        const isSelected = values[opt.key];
        return (
          <TouchableOpacity
            key={opt.key}
            style={styles.checkboxItem}
            onPress={() => toggleValue(opt.key)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isSelected ? "checkbox" : "square-outline"}
              size={22}
              color={isSelected ? colors.primary : colors.outline}
            />
            <Text style={styles.label}>{t(`inputs.${opt.labelKey}`)}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  checkboxItem: { flexDirection: "row", alignItems: "center", width: "48%", gap: 6 },
  label: { fontSize: 15, flexShrink: 1 },
});
