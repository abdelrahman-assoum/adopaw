import { I18nManager, StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import i18n from "../../../../localization/i18n";

export default function Heading({ title, description, align = "center" }) {
  const { colors, fonts } = useTheme();
  const isRTL = i18n.language === "ar" || I18nManager.isRTL;

  const alignment = align === "center" ? "center" : "flex-start";

  const textAlign = align === "center" ? "center" : "start";

  return (
    <View style={[styles.container, { alignItems: alignment }]}>
      <Text
        style={[
          styles.title,
          {
            color: colors.text,
            fontFamily: fonts.displayLarge.fontFamily,
            fontSize: fonts.displayLarge.fontSize,
            lineHeight: fonts.displayLarge.lineHeight,
            textAlign: textAlign,
            writingDirection: isRTL ? "rtl" : "ltr",
          },
        ]}
      >
        {title}
      </Text>

      {description ? (
        <Text
          style={[
            styles.description,
            {
              color:
                title.includes("Get Started") || title.includes("لنبدأ")
                  ? colors.palette.neutral[100]
                  : colors.palette.neutral[500],
              fontFamily: fonts.bodyMedium.fontFamily,
              fontSize: fonts.bodyMedium.fontSize,
              lineHeight: fonts.bodyMedium.lineHeight,
              textAlign: textAlign,
              writingDirection: isRTL ? "rtl" : "ltr",
            },
          ]}
        >
          {description}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 16,
  },
  title: {
    paddingVertical: 12,
  },
  description: {},
});
