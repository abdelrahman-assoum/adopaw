import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text, useTheme } from "react-native-paper";

import { useTranslationLoader } from "@/src/localization/hooks/useTranslationLoader";

const CARD_HEIGHT = 110;
const HIDDEN_OFFSET = 400;

export default function PetBottomCard({ pet, bottom = 0, onDismiss }) {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslationLoader("map");
  const { t: tCommon } = useTranslationLoader("common");

  const slideAnim = useRef(new Animated.Value(HIDDEN_OFFSET)).current;

  useEffect(() => {
    if (pet) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 5,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: HIDDEN_OFFSET,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [pet]);

  const cardBg   = theme.colors.surface;
  const textMain = theme.colors.onSurface;
  const textMuted = theme.dark ? "#9CA3AF" : "#777";

  const isMale    = pet?.gender?.toLowerCase() === "male";
  const genderIcon  = isMale ? "male" : "female";
  const genderColor = isMale
    ? theme.colors.palette?.blue?.[500] ?? "#3B82F6"
    : theme.colors.palette?.coral?.[500] ?? "#EC4899";

  const speciesLabel = pet?.species ? tCommon(`animal.${pet.species}`, pet.species) : "";

  return (
    <Animated.View
      style={[
        styles.wrapper,
        { bottom, transform: [{ translateY: slideAnim }] },
      ]}
      pointerEvents={pet ? "box-none" : "none"}
    >
      <View style={[styles.card, { backgroundColor: cardBg }]}>
        {/* Header row */}
        <View style={styles.row}>
          <Image
            source={{ uri: pet?.images?.[0] }}
            style={styles.photo}
            resizeMode="cover"
          />

          <View style={styles.info}>
            <View style={styles.nameRow}>
              <Text style={[styles.name, { color: textMain }]} numberOfLines={1}>
                {pet?.name}
              </Text>
              <MaterialIcons name={genderIcon} size={16} color={genderColor} style={styles.genderIcon} />
            </View>
            <Text style={[styles.species, { color: textMuted }]}>{speciesLabel}</Text>
          </View>

          <TouchableOpacity
            style={[styles.closeBtn, { backgroundColor: theme.dark ? "rgba(255,255,255,0.08)" : "#F3F4F6" }]}
            onPress={onDismiss}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MaterialIcons name="close" size={16} color={textMuted} />
          </TouchableOpacity>
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={[styles.viewBtn, { backgroundColor: theme.colors.primary }]}
          activeOpacity={0.85}
          onPress={() => {
            if (!pet) return;
            onDismiss?.();
            router.push(`/(tabs)/map/${pet.id}`);
          }}
        >
          <Text style={styles.viewBtnText}>{t("viewProfile")}</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 12,
    right: 12,
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  card: {
    borderRadius: 20,
    padding: 12,
    gap: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  photo: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: "#E5E7EB",
  },
  info: {
    flex: 1,
    gap: 4,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  name: {
    fontFamily: "Alexandria_600SemiBold",
    fontSize: 16,
    flexShrink: 1,
  },
  genderIcon: {
    marginLeft: 6,
  },
  species: {
    fontFamily: "Alexandria_400Regular",
    fontSize: 13,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  viewBtn: {
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
  },
  viewBtnText: {
    fontFamily: "Alexandria_600SemiBold",
    fontSize: 14,
    color: "#fff",
  },
});
