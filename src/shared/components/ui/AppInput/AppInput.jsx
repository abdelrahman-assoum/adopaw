import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { I18nManager as RNI18nManager, StyleSheet, View } from "react-native";
import { Text, TextInput, useTheme } from "react-native-paper";
export default function AppInput({
  value,
  onChangeText,
  placeholder,
  icon = null,
  isPassword = false,
  style,
  max,
  disabled = false,
  keyboardType,
  error = false,
  errorMessage = "",
  onBlur,
  multiline = false,
}) {
  const isRTL = RNI18nManager.isRTL;
  const [secure, setSecure] = useState(isPassword);
  const { colors } = useTheme();

  return (
    <View style={styles.inputWrapper}>
      {icon && (
        <Ionicons
          name={icon}
          size={20}
          color={colors.text}
          style={styles.iconStart}
        />
      )}

      {isPassword && (
        <Ionicons
          name={secure ? "eye-off-outline" : "eye-outline"}
          size={20}
          color={colors.text}
          style={styles.iconEnd}
          onPress={() => setSecure(!secure)}
        />
      )}

      <TextInput
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        maxLength={max}
        keyboardType={keyboardType}
        disabled={disabled}
        placeholder={placeholder}
        multiline={multiline}
        secureTextEntry={isPassword ? secure : false}
        mode="outlined"
        style={[
          styles.input,
          {
            backgroundColor: colors.surface,
            textAlign: isRTL ? "right" : "left",
            paddingStart: icon ? 40 : 8,
            paddingEnd: isPassword ? 40 : 20,
          },
          style,
        ]}
        outlineColor={error ? colors.error : "rgba(169, 169, 169, 0.5)"}
        error={error}
      />
      {error && (
        <Text style={{ color: colors.error, marginTop: 4, marginStart: 8 }}>
          {errorMessage}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  inputWrapper: {
    position: "relative",
  },
  input: {
    borderRadius: 100,
    backgroundColor: "#fff",
  },
  iconStart: {
    position: "absolute",
    start: 20, // automatically adapts to RTL/LTR
    top: 18,
    zIndex: 1,
  },
  iconEnd: {
    position: "absolute",
    end: 20, // automatically adapts to RTL/LTR
    top: 18,
    zIndex: 1,
  },
});
