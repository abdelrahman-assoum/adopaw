import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";
import SelectDropdown from "react-native-select-dropdown";
import { Text, useTheme } from "react-native-paper";

import { useTranslationLoader } from "@/src/localization/hooks/useTranslationLoader";

export default function StandardSelect({
  data = [],
  value,
  onChange,
  labelKey = "",
  placeholderKey = "",
  translationNamespace = "common",
  disabled = false,
}) {
  const { colors } = useTheme();
  const { t } = useTranslationLoader(["common", "addPet"]);
  const selectedItem = data.find((item) => item.value === value);

  return (
    <SelectDropdown
      data={data}
      disabled={disabled}
      onSelect={(item) => onChange(item.value)}
      defaultValue={selectedItem}
      renderButton={(selectedItem, isOpened) => (
        <View style={[styles.dropdownButton, { borderColor: "rgba(169,169,169,0.5)" }]}>
          <Text style={styles.label}>
            {selectedItem
              ? t(`${labelKey}.${selectedItem.value}`, { ns: translationNamespace })
              : t(placeholderKey, { ns: translationNamespace })}
          </Text>
          <Ionicons name={isOpened ? "chevron-up" : "chevron-down"} size={20} color="#888" />
        </View>
      )}
      renderItem={(item) => (
        <View style={styles.dropdownItem}>
          <Text>{t(`${labelKey}.${item.value}`, { ns: translationNamespace })}</Text>
        </View>
      )}
      buttonStyle={{ backgroundColor: colors.background }}
      dropdownStyle={{ backgroundColor: colors.background }}
    />
  );
}

const styles = StyleSheet.create({
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderRadius: 12,
    height: 50,
  },
  dropdownItem: { padding: 12 },
  label: { flex: 1 },
});
