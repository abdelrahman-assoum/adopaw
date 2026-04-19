import { FontAwesome5, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";

import { useTranslationLoader } from "@/src/localization/hooks/useTranslationLoader";

export default function PetChips({ gender, breed, vaccinated, sterilized, dewormed, hasPassport, specialNeeds }) {
  const theme = useTheme();
  const { t } = useTranslationLoader(["petdetails", "common"]);
  const { palette } = theme.colors;

  const healthText = [
    sterilized   ? t("sterilized")   : null,
    vaccinated   ? t("vaccinated")   : null,
    dewormed     ? t("dewormed")     : null,
    specialNeeds ? t("specialNeeds") : null,
    hasPassport  ? t("hasPassport")  : null,
  ].filter(Boolean).join(", ");

  return (
    <View style={styles.row}>
      {breed && (
        <View style={styles.chip}>
          <MaterialCommunityIcons name="paw" size={12} color={palette.coral[500]} />
          <Text variant="labelSmall" style={{ color: palette.coral[500], marginLeft: 4 }}>
            {t(`breed.${breed}`, { ns: "common" })}
          </Text>
        </View>
      )}

      {gender && (
        <View style={styles.chip}>
          <MaterialIcons
            name={gender.toLowerCase() === "male" ? "male" : "female"}
            size={12}
            color={palette.coral[500]}
          />
          <Text variant="labelSmall" style={{ color: palette.coral[500], marginLeft: 4 }}>
            {t(gender.toLowerCase())}
          </Text>
        </View>
      )}

      {(vaccinated || sterilized) && (
        <View style={styles.chip}>
          <FontAwesome5 name="clinic-medical" size={11} color={palette.blue[500]} />
          <Text variant="labelSmall" style={{ color: palette.blue[500], marginLeft: 4 }}>
            {healthText}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "nowrap",
    alignItems: "center",
    gap: 12,
    marginTop: 4,
  },
  chip: { flexDirection: "row", alignItems: "center" },
});
