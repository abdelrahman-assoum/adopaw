import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { useTranslationLoader } from "@/src/localization/hooks/useTranslationLoader";

export default function PetHeader({ name, colors = [], adopted, children }) {
  const { t } = useTranslationLoader("common");

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.nameWrap}>
          <Text variant="headlineLarge" style={styles.name} numberOfLines={1}>
            {name}
          </Text>
          {adopted && (
            <View style={styles.adoptedBadge}>
              <Text style={styles.adoptedText}>{t("status.adopted")}</Text>
            </View>
          )}
        </View>
        <View style={styles.colorRow}>
          {colors.map((color, index) => (
            <View
              key={index}
              style={[styles.colorCircle, { backgroundColor: color }]}
            />
          ))}
        </View>
      </View>
      {children && <View style={{ marginTop: 4 }}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 8 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  nameWrap: {
    flexShrink: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  name: { flexShrink: 1 },
  adoptedBadge: {
    backgroundColor: "#22C55E",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  adoptedText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "Alexandria_600SemiBold",
    lineHeight: 18,
  },
  colorRow: { flexDirection: "row", gap: 6, flexShrink: 0 },
  colorCircle: {
    width: 20,
    height: 20,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "#ccc",
  },
});
