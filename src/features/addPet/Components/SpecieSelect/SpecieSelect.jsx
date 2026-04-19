import { Ionicons } from "@expo/vector-icons";
import { Image, StyleSheet, View } from "react-native";
import SelectDropdown from "react-native-select-dropdown";
import { Text, useTheme } from "react-native-paper";

import { useTranslationLoader } from "@/src/localization/hooks/useTranslationLoader";
import { animalOptions } from "@/src/shared/constants/animals";

export default function SpecieSelect({ value, onChange }) {
  const { colors } = useTheme();
  const { t } = useTranslationLoader(["common", "addPet"]);

  return (
    <SelectDropdown
      data={animalOptions}
      onSelect={(selectedItem) => onChange(selectedItem.value)}
      defaultValue={animalOptions.find((a) => a.value === value)}
      renderButton={(selectedItem, isOpened) => (
        <View style={[styles.dropdownButton, { borderColor: "rgba(169,169,169,0.5)" }]}>
          {selectedItem ? (
            <>
              <Image source={selectedItem.image} style={styles.icon} />
              <Text style={styles.label}>{t(selectedItem.labelKey)}</Text>
            </>
          ) : (
            <Text style={styles.label}>{t("inputs.specie.placeholder", { ns: "addPet" })}</Text>
          )}
          <Ionicons name={isOpened ? "chevron-up" : "chevron-down"} size={20} color="#888" />
        </View>
      )}
      renderItem={(item) => (
        <View style={styles.dropdownItem}>
          <Image source={item.image} style={styles.icon} />
          <Text>{t(item.labelKey)}</Text>
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
  dropdownItem: { flexDirection: "row", alignItems: "center", padding: 12 },
  icon: { width: 24, height: 24, marginRight: 8 },
  label: { flex: 1 },
});
