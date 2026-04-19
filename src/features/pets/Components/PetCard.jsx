import { MaterialIcons } from "@expo/vector-icons";
import { Image, StyleSheet, TouchableOpacity, View, useWindowDimensions } from "react-native";
import { Text, useTheme } from "react-native-paper";

import { useTranslationLoader } from "@/src/localization/hooks/useTranslationLoader";

const headerBgBySpecies = {
  cat:     "#FFE8F0",
  dog:     "#FFEFE2",
  rabbit:  "#F3E9FF",
  fish:    "#E8F5FF",
  bird:    "#F1FFE8",
  hamster: "#FFF6E8",
};

function formatAge(ageValue, ageUnit, t) {
  if (ageValue == null || !ageUnit) return "";
  if (ageUnit === "months") return t("age.months", { count: ageValue });
  if (ageUnit === "years") return t("age.years", { count: ageValue });
  return `${ageValue} ${ageUnit}`;
}

export default function PetCard({ pet, onPress, distanceText }) {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const { t } = useTranslationLoader("common");

  const H_PADDING = 16;
  const GAP = 12;
  const cardWidth = Math.floor((width - H_PADDING * 2 - GAP) / 2);

  const isMale = pet.gender?.toLowerCase() === "male";
  const genderIcon = isMale ? "male" : "female";
  const genderColor = isMale
    ? theme.colors.palette.blue[500]
    : theme.colors.palette.coral[500];

  const headerBg = headerBgBySpecies[pet.species] ?? "#F3F4F6";
  const nameFont = theme.fonts.titleLarge;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[styles.card, { width: cardWidth, backgroundColor: theme.colors.surface }]}
    >
      <View style={[styles.header, { backgroundColor: headerBg }]}>
        <Image source={{ uri: pet.images?.[0] }} style={styles.image} resizeMode="cover" />
      </View>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{
              fontFamily: nameFont.fontFamily,
              fontSize: nameFont.fontSize,
              lineHeight: nameFont.lineHeight,
              fontWeight: "800",
              color: theme.colors.onSurface,
              flexShrink: 1,
            }}
          >
            {pet.name}
          </Text>
          <MaterialIcons name={genderIcon} size={nameFont.fontSize} color={genderColor} style={{ marginLeft: 6 }} />
        </View>

        <View style={styles.pills}>
          {pet.age_value != null && (
            <Pill
              text={formatAge(pet.age_value, pet.age_unit, t)}
              bg="#E8F2FF"
              fg={theme.colors.palette.blue[500]}
              icon="access-time"
            />
          )}
          {pet.breed && (
            <Pill
              text={t(`breed.${pet.breed}`)}
              bg="#FDE7EF"
              fg="#EC4899"
              icon="pets"
            />
          )}
          {distanceText && (
            <Pill text={distanceText} bg="#EEEEEE" fg="#6B7280" icon="location-on" />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

function Pill({ text, bg, fg, icon }) {
  return (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      {icon && <MaterialIcons name={icon} size={14} color={fg} style={{ marginRight: 6 }} />}
      <Text numberOfLines={1} style={{ color: fg, fontSize: 12, fontWeight: "600" }}>
        {text}
      </Text>
    </View>
  );
}

const RADIUS = 18;

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    marginBottom: 12,
    padding: 12,
    overflow: "hidden",
  },
  header: { borderRadius: RADIUS, overflow: "hidden" },
  image: { width: "100%", aspectRatio: 1 },
  content: { marginTop: 10 },
  titleRow: { flexDirection: "row", alignItems: "center" },
  pills: { flexDirection: "row", flexWrap: "wrap", marginTop: 10 },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    marginRight: 8,
    marginTop: 8,
  },
});
