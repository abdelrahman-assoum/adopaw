import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text, useTheme } from "react-native-paper";

const CATEGORY_CONFIG = {
  veterinary: { emoji: "🏥", label: "Nearby Vets", color: "#3A2A91" },
  petStore:   { emoji: "🏪", label: "Nearby Pet Stores", color: "#E9661F" },
  park:       { emoji: "🌳", label: "Nearby Parks", color: "#36BA7A" },
  shelter:    { emoji: "🏠", label: "Nearby Shelters", color: "#4D9DE0" },
};

export default function PlaceSuggestionCard({ category, places }) {
  const theme = useTheme();
  const router = useRouter();

  const config = CATEGORY_CONFIG[category];
  if (!config || !places?.length) return null;

  const filtered = places
    .filter((p) => p.category === category)
    .slice(0, 3);

  if (!filtered.length) return null;

  const handlePress = (place) => {
    router.push({
      pathname: "/(tabs)/map",
      params: {
        focusPlaceId: place.id,
        focusLat: String(place.latitude),
        focusLng: String(place.longitude),
      },
    });
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.labelRow}>
        <Text style={[styles.label, { color: theme.colors.outline }]}>
          {config.emoji} {config.label}
        </Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {filtered.map((place) => (
          <TouchableOpacity
            key={place.id}
            style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)" }]}
            onPress={() => handlePress(place)}
            activeOpacity={0.75}
          >
            <View style={styles.cardTop}>
              <Text style={[styles.placeName, { color: theme.colors.onSurface }]} numberOfLines={1}>
                {place.name}
              </Text>
              {place.isOpen != null && (
                <View style={[styles.badge, { backgroundColor: place.isOpen ? "#22C55E18" : "#EF444418" }]}>
                  <Text style={[styles.badgeText, { color: place.isOpen ? "#16A34A" : "#DC2626" }]}>
                    {place.isOpen ? "Open" : "Closed"}
                  </Text>
                </View>
              )}
            </View>
            {place.description ? (
              <Text style={[styles.placeDesc, { color: theme.colors.outline }]} numberOfLines={1}>
                {place.description}
              </Text>
            ) : null}
            <View style={styles.mapRow}>
              <Ionicons name="map-outline" size={11} color={config.color} />
              <Text style={[styles.mapLabel, { color: config.color }]}>View on map</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginTop: 6, marginLeft: 44 },
  labelRow: { marginBottom: 6 },
  label: {
    fontFamily: "Alexandria_400Regular",
    fontSize: 11,
  },
  scroll: { gap: 8, paddingRight: 16 },
  card: {
    width: 160,
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
    gap: 3,
  },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  placeName: {
    fontFamily: "Alexandria_500Medium",
    fontSize: 12,
    flex: 1,
  },
  badge: {
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  badgeText: {
    fontFamily: "Alexandria_500Medium",
    fontSize: 10,
  },
  placeDesc: {
    fontFamily: "Alexandria_400Regular",
    fontSize: 11,
  },
  mapRow: { flexDirection: "row", alignItems: "center", gap: 3, marginTop: 4 },
  mapLabel: {
    fontFamily: "Alexandria_400Regular",
    fontSize: 11,
  },
});
