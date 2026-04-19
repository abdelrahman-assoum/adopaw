import { Ionicons } from "@expo/vector-icons";
import { I18nManager as RNI18nManager, StyleSheet, TouchableWithoutFeedback, View } from "react-native";
import { TextInput, useTheme } from "react-native-paper";

import { useTranslationLoader } from "@/src/localization/hooks/useTranslationLoader";

export default function MapPicker({ onPress }) {
  const { colors } = useTheme();
  const isRTL = RNI18nManager.isRTL;
  const { t } = useTranslationLoader("common");

  return (
    <View style={styles.inputWrapper}>
      <TouchableWithoutFeedback onPress={onPress}>
        <View>
          <Ionicons name="map-outline" size={20} color={colors.text} style={styles.iconStart} />
          <TextInput
            value={t("location.specific")}
            editable={false}
            mode="outlined"
            pointerEvents="none"
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                textAlign: isRTL ? "right" : "left",
                paddingStart: 40,
                paddingEnd: 20,
              },
            ]}
            outlineColor="rgba(169,169,169,0.5)"
          />
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
}

const styles = StyleSheet.create({
  inputWrapper: { position: "relative", marginVertical: 6 },
  input: { borderRadius: 100 },
  iconStart: { position: "absolute", start: 20, top: 18, zIndex: 1 },
});
