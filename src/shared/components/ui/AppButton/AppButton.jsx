import { StyleSheet } from "react-native";
import { Button, useTheme } from "react-native-paper";

export default function AppButton({
  text,
  onPress,
  variant = "primary",
  loading,
  disabled,
  style,
}) {
  const { colors, fonts, dark } = useTheme();

  const isPrimary = variant === "primary";
  const isDisabled = disabled || loading;

  const backgroundColor = isDisabled
    ? dark
      ? colors.palette.neutral[700]
      : colors.palette.neutral[300]
    : isPrimary
      ? colors.palette.coral[500]
      : colors.palette.blue[100];

  const textColor = isDisabled
    ? colors.palette.neutral[500] // fallback for disabled text
    : isPrimary
      ? "#fff"
      : colors.palette.blue[500];

  const borderColor =
    isPrimary || isDisabled ? "transparent" : colors.palette.blue[500];

  return (
    <Button
      mode="contained"
      onPress={onPress}
      loading={loading}
      disabled={isDisabled}
      contentStyle={styles.buttonContent}
      style={[
        styles.button,
        {
          backgroundColor,
          borderColor,
          borderWidth: isPrimary || isDisabled ? 0 : 1,
        },
        style,
      ]}
      labelStyle={{
        fontFamily: fonts.labelLarge.fontFamily,
        fontSize: fonts.labelLarge.fontSize,
        lineHeight: fonts.labelLarge.lineHeight,
        color: textColor,
      }}
      uppercase={false}
    >
      {text}
    </Button>
  );
}

const styles = StyleSheet.create({
  button: {
    width: "100%",
  },
  buttonContent: {
    height: 50,
  },
});
