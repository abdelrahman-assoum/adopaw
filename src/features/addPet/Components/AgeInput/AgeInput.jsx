import { StyleSheet, View } from "react-native";

import { useTranslationLoader } from "@/src/localization/hooks/useTranslationLoader";
import AppInput from "@/src/shared/components/ui/AppInput/AppInput";
import StandardSelect from "../StandardSelect/StandardSelect";

const ageUnits = [
  { labelKey: "inputs.age", value: "days" },
  { labelKey: "inputs.age", value: "months" },
  { labelKey: "inputs.age", value: "years" },
];

export default function PetAgeInput({ age, onChange }) {
  const { t } = useTranslationLoader("addPet");

  return (
    <View style={styles.container}>
      <AppInput
        keyboardType="numeric"
        placeholder={t("inputs.age.placeholder")}
        value={age.value}
        onChangeText={(text) => onChange({ ...age, value: text })}
        style={{ height: 50, flex: 1 }}
      />
      <View style={{ flex: 1 }}>
        <StandardSelect
          data={ageUnits}
          value={age.unit}
          onChange={(unitValue) => onChange({ ...age, unit: unitValue })}
          placeholderKey="inputs.ageUnit.placeholder"
          translationNamespace="addPet"
          labelKey="inputs.age"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: "row", alignItems: "center", gap: 8 },
});
