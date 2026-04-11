import { I18nManager, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Text, useTheme } from "react-native-paper";

export default function LoginWithGoogleButton({ style, title, onPress, disabled }) {
  const isRTL = I18nManager.isRTL;
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.button,
        style,
        disabled && { opacity: 0.5 },
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Image
        source={{
          uri: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/2048px-Google_%22G%22_logo.svg.png",
        }}
        style={styles.logo}
      />
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  logo: {
    width: 18,
    height: 18,
    resizeMode: "contain",
  },
  text: {
    fontSize: 16,
    fontWeight: "500",
  },
});
