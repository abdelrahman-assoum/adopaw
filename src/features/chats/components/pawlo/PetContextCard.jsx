import { Ionicons } from "@expo/vector-icons";
import { Image, StyleSheet, View } from "react-native";
import { Surface, Text, useTheme } from "react-native-paper";

export default function PetContextCard({ pet, petContext }) {
  const theme = useTheme();
  if (!petContext?.name) return null;

  const image = pet?.images?.[0] ?? null;
  const chips = (petContext.health ?? []).slice(0, 3);

  return (
    <View style={styles.wrapper}>
      <Surface
        elevation={0}
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.primaryContainer,
            borderColor: theme.colors.primary + "30",
          },
        ]}
      >
        <View style={styles.row}>
          {image ? (
            <Image source={{ uri: image }} style={styles.image} />
          ) : (
            <View style={[styles.imagePlaceholder, { backgroundColor: theme.colors.primary + "20" }]}>
              <Ionicons name="paw" size={24} color={theme.colors.primary} />
            </View>
          )}

          <View style={styles.info}>
            <Text style={[styles.name, { color: theme.colors.onPrimaryContainer }]}>
              {petContext.name}
            </Text>
            <Text style={[styles.meta, { color: theme.colors.onPrimaryContainer + "BB" }]}>
              {[petContext.species, petContext.breed, petContext.age]
                .filter(Boolean)
                .join(" · ")}
            </Text>

            {chips.length > 0 && (
              <View style={styles.chips}>
                {chips.map((chip) => (
                  <View
                    key={chip}
                    style={[styles.chip, { backgroundColor: theme.colors.primary + "20" }]}
                  >
                    <Text style={[styles.chipText, { color: theme.colors.primary }]}>
                      {chip}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 4 },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
  },
  row: { flexDirection: "row", gap: 12, alignItems: "center" },
  image: {
    width: 72,
    height: 72,
    borderRadius: 12,
    flexShrink: 0,
  },
  imagePlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  info: { flex: 1, gap: 4 },
  name: {
    fontFamily: "Alexandria_700Bold",
    fontSize: 16,
  },
  meta: {
    fontFamily: "Alexandria_400Regular",
    fontSize: 12,
  },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 4, marginTop: 2 },
  chip: {
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  chipText: {
    fontFamily: "Alexandria_500Medium",
    fontSize: 10,
  },
});
