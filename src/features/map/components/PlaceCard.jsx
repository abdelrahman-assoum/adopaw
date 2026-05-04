import { Ionicons } from "@expo/vector-icons";
import { Linking, Pressable, Share, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "react-native-paper";
import { CATEGORY_CONFIG } from "../data/places";
import { useTranslationLoader } from "@/src/localization/hooks/useTranslationLoader";

function StarRow({ rating }) {
  return (
    <View style={styles.starRow}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Ionicons
          key={i}
          name={i <= Math.round(rating) ? "star" : "star-outline"}
          size={12}
          color="#E9661F"
        />
      ))}
    </View>
  );
}

function openDirections(place) {
  const url = `https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`;
  Linking.openURL(url);
}

async function sharePlace(place) {
  try {
    await Share.share({
      message: `${place.name} — ${place.description}\nhttps://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`,
    });
  } catch { /* ignore */ }
}

export default function PlaceCard({ place, onPress }) {
  const { t } = useTranslationLoader("map");
  const theme = useTheme();
  const config = CATEGORY_CONFIG[place.category];

  const cardBg    = theme.dark ? "#2E3338" : "#fff";
  const border    = theme.dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)";
  const textMain  = theme.colors.onSurface;
  const textMuted = theme.dark ? "#9CA3AF" : "#555";
  const actionBg  = theme.dark ? "rgba(255,255,255,0.07)" : "#F3F4F6";
  const actionFg  = theme.dark ? "#D1D5DB" : "#3C3C3C";

  return (
    <View style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}>
      <Pressable onPress={onPress} style={styles.infoArea}>
        <View style={styles.headerRow}>
          <View style={[styles.iconCircle, { backgroundColor: config.color }]}>
            <Text style={styles.iconEmoji}>{config.emoji}</Text>
          </View>
          <View style={styles.nameCol}>
            <Text style={[styles.placeName, { color: textMain }]}>{place.name}</Text>
            <Text style={[styles.categoryLabel, { color: config.color }]}>
              {t(`categories.${place.category}`, config.label)}
            </Text>
          </View>
        </View>

        {!!place.description && (
          <Text style={[styles.description, { color: textMuted }]}>{place.description}</Text>
        )}
      </Pressable>

      <View style={styles.metaRow}>
        {place.rating > 0 && (
          <View style={styles.ratingRow}>
            <StarRow rating={place.rating} />
            <Text style={[styles.ratingText, { color: textMuted }]}>{place.rating.toFixed(1)}</Text>
            {place.reviewCount > 0 && (
              <>
                <View style={[styles.dot, { backgroundColor: theme.colors.placeholder }]} />
                <Text style={[styles.reviewText, { color: textMuted }]}>
                  {t("reviews", { count: place.reviewCount, defaultValue: `${place.reviewCount} reviews` })}
                </Text>
              </>
            )}
          </View>
        )}
        {place.isOpen != null && (
          <Text style={[styles.openStatus, { color: place.isOpen ? "#36BA7A" : "#D23737" }]}>
            {place.isOpen ? t("openNow", "Open Now") : t("closed", "Closed")}
          </Text>
        )}
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: actionBg }]} onPress={() => openDirections(place)}>
          <Ionicons name="navigate-outline" size={16} color={actionFg} />
          <Text style={[styles.actionLabel, { color: actionFg }]}>{t("directions", "Directions")}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: actionBg }]} onPress={() => sharePlace(place)}>
          <Ionicons name="share-outline" size={16} color={actionFg} />
          <Text style={[styles.actionLabel, { color: actionFg }]}>{t("share", "Share")}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    gap: 8,
  },
  infoArea: { gap: 8 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  iconEmoji: { fontSize: 18 },
  nameCol: { flex: 1, gap: 2 },
  placeName: {
    fontFamily: "Alexandria_400Regular",
    fontSize: 16,
    lineHeight: 24,
  },
  categoryLabel: {
    fontFamily: "Alexandria_400Regular",
    fontSize: 12,
    lineHeight: 18,
  },
  description: {
    fontFamily: "Alexandria_400Regular",
    fontSize: 14,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  starRow: {
    flexDirection: "row",
    gap: 2,
  },
  ratingText: {
    fontFamily: "Alexandria_400Regular",
    fontSize: 12,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
  },
  reviewText: {
    fontFamily: "Alexandria_400Regular",
    fontSize: 12,
  },
  openStatus: {
    fontFamily: "Alexandria_400Regular",
    fontSize: 12,
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
    paddingTop: 4,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    borderRadius: 4,
    paddingVertical: 8,
  },
  actionLabel: {
    fontFamily: "Alexandria_600SemiBold",
    fontSize: 12,
  },
});
