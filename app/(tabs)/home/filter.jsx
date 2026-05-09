import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Switch, TouchableOpacity, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import PetsCategories from "@/src/features/home/components/PetsCategories";
import { useProfile } from "@/src/features/profile/hooks/useProfile";
import { updatePetPreferences } from "@/src/features/auth/services/profileServices";
import { useTranslationLoader } from "@/src/localization/hooks/useTranslationLoader";
import AppButton from "@/src/shared/components/ui/AppButton/AppButton";
import { supabase } from "@/src/shared/services/supabase/client";

// ─── Age range → filter category mapping ─────────────────────────────────────
function toYears(value, unit) {
  return unit === "months" ? value / 12 : value;
}

function ageRangeToCategories(ageRange) {
  if (!ageRange?.min || !ageRange?.max) return [];
  const min = toYears(ageRange.min.value, ageRange.min.unit);
  const max = toYears(ageRange.max.value, ageRange.max.unit);
  const result = [];
  if (min < 1) result.push("baby");
  if (min < 3 && max > 1) result.push("young");
  if (min < 7 && max > 3) result.push("adult");
  if (max >= 7) result.push("senior");
  return result;
}

// ─── Option group component ───────────────────────────────────────────────────
function OptionGroup({ label, options, selected, onToggle, theme }) {
  const neutral = theme.colors.palette.neutral;
  return (
    <View style={styles.group}>
      <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>{label}</Text>
      <View style={styles.row}>
        {options.map((opt) => {
          const isSelected = selected.includes(opt.key);
          return (
            <TouchableOpacity
              key={opt.key}
              style={[
                styles.optionButton,
                {
                  backgroundColor: isSelected ? theme.colors.primary : theme.colors.surface,
                  borderColor: isSelected ? theme.colors.primary : neutral[300],
                },
              ]}
              onPress={() => onToggle(opt.key)}
            >
              <Text
                variant="labelMedium"
                style={{ color: isSelected ? "#fff" : theme.colors.onSurface }}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function makeToggle(setter) {
  return (key) =>
    setter((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
}

export default function FilterScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslationLoader("home");

  const params = useLocalSearchParams();
  const parseParam = (val) => (val ? val.split(",").filter(Boolean) : []);

  const [selectedCategory, setSelectedCategory] = useState(() => parseParam(params.species));
  const [selectedAge, setSelectedAge]           = useState(() => parseParam(params.age));
  const [selectedSize, setSelectedSize]         = useState(() => parseParam(params.size));
  const [selectedGender, setSelectedGender]     = useState(() => parseParam(params.gender));
  const [selectedActivity, setSelectedActivity] = useState(() => parseParam(params.activity));
  const [distance, setDistance]                 = useState(() => params.distance ? Number(params.distance) : 150);
  const [hideOwnPets, setHideOwnPets]           = useState(() => params.hideOwnPets === "true");

  // ─── Load user profile for pet preferences ────────────────────────────────
  const [userId, setUserId] = useState(null);
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
    });
  }, []);
  const { data: profile } = useProfile(userId);

  const petPrefs = profile?.pet_preferences ?? null;

  // Seed hideOwnPets from saved profile value when profile first loads
  // (only if no URL param was already set)
  useEffect(() => {
    if (petPrefs?.hideOwnPets != null && params.hideOwnPets == null) {
      setHideOwnPets(petPrefs.hideOwnPets);
    }
  }, [petPrefs]);

  const hasPetPrefs = !!(
    petPrefs &&
    (petPrefs.species?.length || petPrefs.gender?.length || petPrefs.ageRange)
  );

  const applyMyPreferences = () => {
    if (!petPrefs) return;
    setSelectedCategory(petPrefs.species ?? []);
    setSelectedGender(petPrefs.gender ?? []);
    setSelectedAge(ageRangeToCategories(petPrefs.ageRange));
    // size and activity are not part of pet preferences — leave as-is
  };

  const ageOptions      = ["baby", "young", "adult", "senior"].map((k) => ({ key: k, label: t(`age.${k}`) }));
  const sizeOptions     = ["small", "medium", "large"].map((k) => ({ key: k, label: t(`size.${k}`) }));
  const genderOptions   = ["male", "female"].map((k) => ({ key: k, label: t(`gender.${k}`) }));
  const activityOptions = ["low", "medium", "high"].map((k) => ({ key: k, label: t(`activity.${k}`) }));

  const handleReset = () => {
    setSelectedCategory([]);
    setSelectedAge([]);
    setSelectedSize([]);
    setSelectedGender([]);
    setSelectedActivity([]);
    setDistance(150);
    setHideOwnPets(false);
  };

  const handleApply = async () => {
    if (userId && petPrefs !== undefined) {
      try {
        await updatePetPreferences(userId, { ...(petPrefs ?? {}), hideOwnPets });
      } catch {
        // non-blocking — filter still applies even if save fails
      }
    }
    router.dismissTo({
      pathname: "/(tabs)/home",
      params: {
        species:      selectedCategory.join(","),
        age:          selectedAge.join(","),
        size:         selectedSize.join(","),
        gender:       selectedGender.join(","),
        activity:     selectedActivity.join(","),
        distance:     String(distance),
        hideOwnPets:  String(hideOwnPets),
      },
    });
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* ── Header ─────────────────────────────────────────────────────── */}
          <View style={styles.headerRow}>
            <TouchableOpacity
              style={[styles.backButton, { borderColor: theme.colors.palette.neutral[300] }]}
              onPress={() => router.back()}
            >
              <Text>{"←"}</Text>
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>
              {t("filters.title")}
            </Text>
          </View>

          {/* ── Use My Preferences ─────────────────────────────────────────── */}
          <TouchableOpacity
            style={[
              styles.myPrefsButton,
              {
                backgroundColor: hasPetPrefs
                  ? theme.colors.primaryContainer ?? theme.colors.primary + "18"
                  : theme.colors.surfaceVariant ?? theme.colors.surface,
                borderColor: hasPetPrefs
                  ? theme.colors.primary
                  : theme.colors.palette.neutral[300],
                opacity: hasPetPrefs ? 1 : 0.5,
              },
            ]}
            onPress={applyMyPreferences}
            disabled={!hasPetPrefs}
          >
            <Ionicons
              name="heart-outline"
              size={16}
              color={hasPetPrefs ? theme.colors.primary : theme.colors.onSurface}
            />
            <View style={styles.myPrefsTextWrap}>
              <Text
                variant="labelLarge"
                style={{
                  color: hasPetPrefs ? theme.colors.primary : theme.colors.onSurface,
                  fontWeight: "600",
                }}
              >
                {t("filters.useMyPrefs")}
              </Text>
              {!hasPetPrefs && (
                <Text
                  variant="labelSmall"
                  style={{ color: theme.colors.palette.neutral[500], marginTop: 2 }}
                >
                  {t("filters.noPrefsHint")}
                </Text>
              )}
            </View>
          </TouchableOpacity>

          {/* ── Hide own listings toggle ───────────────────────────────────── */}
          <TouchableOpacity
            style={[styles.toggleRow, { backgroundColor: theme.colors.surface, borderColor: theme.colors.palette.neutral[300] }]}
            onPress={() => setHideOwnPets((v) => !v)}
            activeOpacity={0.8}
          >
            <Ionicons name="eye-off-outline" size={18} color={theme.colors.primary} />
            <View style={styles.toggleTextWrap}>
              <Text variant="labelLarge" style={{ color: theme.colors.onSurface, fontWeight: "600" }}>
                {t("filters.hideOwnPets")}
              </Text>
              <Text variant="labelSmall" style={{ color: theme.colors.palette.neutral[500], marginTop: 2 }}>
                {t("filters.hideOwnPetsHint")}
              </Text>
            </View>
            <Switch
              value={hideOwnPets}
              onValueChange={setHideOwnPets}
              trackColor={{ false: theme.colors.palette.neutral[300], true: theme.colors.primary + "70" }}
              thumbColor={hideOwnPets ? theme.colors.primary : "#f4f3f4"}
            />
          </TouchableOpacity>

          {/* ── Filter groups ───────────────────────────────────────────────── */}
          <View style={styles.group}>
            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
              {t("category.label")}
            </Text>
            <PetsCategories selected={selectedCategory} onSelect={setSelectedCategory} multi />
          </View>

          <OptionGroup label={t("age.label")}      options={ageOptions}      selected={selectedAge}      onToggle={makeToggle(setSelectedAge)}      theme={theme} />
          <OptionGroup label={t("size.label")}     options={sizeOptions}     selected={selectedSize}     onToggle={makeToggle(setSelectedSize)}     theme={theme} />
          <OptionGroup label={t("gender.label")}   options={genderOptions}   selected={selectedGender}   onToggle={makeToggle(setSelectedGender)}   theme={theme} />
          <OptionGroup label={t("activity.label")} options={activityOptions} selected={selectedActivity} onToggle={makeToggle(setSelectedActivity)} theme={theme} />

          <View style={styles.group}>
            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
              {t("location.label")}
            </Text>
            <Text style={{ marginBottom: 8, color: theme.colors.onSurface }}>
              {distance >= 150 ? "150+ km" : `${distance} km`}
            </Text>
            <Slider
              style={{ width: "100%", height: 40 }}
              minimumValue={1}
              maximumValue={150}
              step={1}
              value={distance}
              onValueChange={setDistance}
              minimumTrackTintColor={theme.colors.primary}
              maximumTrackTintColor={theme.colors.palette.neutral[300]}
              thumbTintColor={theme.colors.primary}
            />
          </View>
        </ScrollView>

        <View style={styles.buttonRow}>
          <AppButton text={t("reset")} variant="secondary" onPress={handleReset} style={{ flex: 1, marginRight: 8 }} />
          <AppButton text={t("done")}  variant="primary"   onPress={handleApply}  style={{ flex: 1, marginLeft: 8 }} />
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 16, paddingBottom: 8 },
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  headerTitle: { fontSize: 18, fontWeight: "600" },
  myPrefsButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  myPrefsTextWrap: { flex: 1 },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  toggleTextWrap: { flex: 1 },
  sectionTitle: { fontSize: 16, fontWeight: "600", marginBottom: 8 },
  group: { marginVertical: 8 },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 8 },
  optionButton: {
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  buttonRow: { flexDirection: "row", padding: 16, paddingTop: 8 },
});
