import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

import { useTranslationLoader } from "@/src/localization/hooks/useTranslationLoader";

export default function AboutText({ description }) {
  const { t } = useTranslationLoader("petdetails");

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.heading}>{t("about")}</Text>
      <Text variant="bodyMedium" style={styles.body}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 24 },
  heading: { marginBottom: 8 },
  body: { lineHeight: 20 },
});
