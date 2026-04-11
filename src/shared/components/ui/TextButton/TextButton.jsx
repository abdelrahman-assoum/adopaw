import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import i18n from "../../../../localization/i18n";

export default function CustomTextButton({
  label,
  buttonText,
  onPress,
  style,
  labelStyle,
  buttonTextStyle,
}) {
  const currentLang = i18n.language;

  const { colors } = useTheme();
  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.label, labelStyle]}>{label} </Text>
      <TouchableOpacity onPress={onPress}>
        <Text
          style={[
            styles.buttonText,
            buttonTextStyle,
            { color: colors.primary },
          ]}
        >
          {buttonText}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 16,
    gap: 4,
  },
  label: {
    fontSize: 14,
    color: "#666",
  },
  buttonText: {
    fontSize: 14,
    color: "#3498db",
    fontWeight: "600",
  },
});
