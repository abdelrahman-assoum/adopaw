import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Dimensions, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { formatAgeRange } from "@/src/features/auth/utils/age-range";
import { updatePetPreferences } from "@/src/features/auth/services/profileServices";
import { useProfile } from "@/src/features/profile/hooks/useProfile";
import { useTranslationLoader } from "@/src/localization/hooks/useTranslationLoader";
import AgeSlider from "@/src/shared/components/ui/AgeSlider/AgeSlider";
import AppButton from "@/src/shared/components/ui/AppButton/AppButton";
import AppSnackbar from "@/src/shared/components/ui/Snackbar/AppSnackbar";
import ColorSelectOption from "@/src/shared/components/ui/ColorSelectOption/ColorSelectOption";
import SelectOption from "@/src/shared/components/ui/CustomSelect/SelectOption";
import Heading from "@/src/shared/components/ui/Heading/Heading";
import InputLabel from "@/src/shared/components/ui/InputLabel/InputLabel";
import LoadingModal from "@/src/shared/components/ui/LoadingModal/LoadingModal";
import { animalOptions } from "@/src/shared/constants/animals";
import { animalsColors, gender } from "@/src/shared/constants/prefs";
import { supabase } from "@/src/shared/services/supabase/client";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const H_PAD = 28 * 2;
const AVAILABLE_WIDTH = SCREEN_WIDTH - H_PAD;
const SPECIES_COLS = 3;
const speciesCardWidth = Math.floor((AVAILABLE_WIDTH - 8 * (SPECIES_COLS - 1)) / SPECIES_COLS);
const COLOR_COLS = 4;
const colorItemWidth = Math.floor((AVAILABLE_WIDTH - 8 * (COLOR_COLS - 1)) / COLOR_COLS);

// Convert stored ageRange back to slider [min, max] in years
function ageRangeToSlider(ageRange) {
  if (!ageRange?.min || !ageRange?.max) return [0.083, 15];
  const toYears = (v, u) => (u === "months" ? v / 12 : v);
  return [
    toYears(ageRange.min.value, ageRange.min.unit),
    toYears(ageRange.max.value, ageRange.max.unit),
  ];
}

export default function UserPetPreferences() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslationLoader(["profile", "auth", "common"]);

  const [userId, setUserId] = useState(null);
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
    });
  }, []);

  const { data: profile, isLoading: profileLoading } = useProfile(userId);

  // ─── Form state ───────────────────────────────────────────────────────────
  const [selectedSpecies, setSelectedSpecies] = useState([]);
  const [selectedGenders, setSelectedGenders] = useState([]);
  const [selectedColors, setSelectedColors]   = useState([]);
  const [selectedAge, setSelectedAge]         = useState([0.083, 15]);
  const [initialized, setInitialized]         = useState(false);

  // Pre-fill from saved preferences once profile loads
  useEffect(() => {
    if (!profile || initialized) return;
    const prefs = profile.pet_preferences;
    if (prefs) {
      setSelectedSpecies(prefs.species ?? []);
      setSelectedGenders(prefs.gender ?? []);
      setSelectedColors(prefs.colors ?? []);
      setSelectedAge(ageRangeToSlider(prefs.ageRange));
    }
    setInitialized(true);
  }, [profile]);

  // ─── UI state ─────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  // ─── Toggle helpers ───────────────────────────────────────────────────────
  const toggle = (setter) => (value) =>
    setter((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );

  // ─── Save ─────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const petPreferences = {
        species: selectedSpecies,
        gender: selectedGenders,
        ageRange: formatAgeRange(selectedAge),
        colors: selectedColors,
      };
      await updatePetPreferences(userId, petPreferences);
      setSnackbarMessage(t("petPreferences.saveSuccess", { ns: "profile" }));
      setSnackbarVisible(true);
      setTimeout(() => router.back(), 1200);
    } catch (err) {
      setSnackbarMessage(t("error.updateFailed", { ns: "profile" }));
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.surface }]}>
      <LoadingModal loading={loading || (profileLoading && !initialized)} />

      <AppSnackbar
        visible={snackbarVisible}
        message={snackbarMessage}
        onDismiss={() => setSnackbarVisible(false)}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.container,
          {
            paddingTop: insets.top + 16,
            paddingBottom: Math.max(insets.bottom + 24, 40),
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Back button ──────────────────────────────────────────────────── */}
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={26} color={colors.onSurface ?? colors.text} />
        </TouchableOpacity>

        <Heading
          title={t("petPreferences.title", { ns: "profile" })}
          description={t("petPreferences.description", { ns: "profile" })}
          align="start"
        />

        {/* ── Species ──────────────────────────────────────────────────────── */}
        <View style={styles.section}>
          <InputLabel text={t("petPref.labels.specie", { ns: "auth" })} />
          <View style={styles.speciesGrid}>
            {animalOptions.map((option) => (
              <SelectOption
                key={option.value}
                label={t(option.labelKey, { ns: "common" })}
                image={option.image}
                selected={selectedSpecies.includes(option.value)}
                onPress={() => toggle(setSelectedSpecies)(option.value)}
                style={{ width: speciesCardWidth }}
              />
            ))}
          </View>
        </View>

        {/* ── Gender ───────────────────────────────────────────────────────── */}
        <View style={styles.section}>
          <InputLabel text={t("petPref.labels.gender", { ns: "auth" })} />
          <View style={styles.genderRow}>
            {gender.map((option) => (
              <SelectOption
                key={option.value}
                label={t(`gender.${option.value}`, { ns: "common" })}
                icon={option.iconName}
                iconColor={option.iconColor}
                selected={selectedGenders.includes(option.value)}
                onPress={() => toggle(setSelectedGenders)(option.value)}
                style={styles.genderOption}
              />
            ))}
          </View>
        </View>

        {/* ── Colors ───────────────────────────────────────────────────────── */}
        <View style={styles.section}>
          <InputLabel text={t("petPref.labels.color", { ns: "auth" })} />
          <View style={styles.colorGrid}>
            {animalsColors.map((option) => (
              <ColorSelectOption
                key={option.value}
                label={t(`colors.${option.label}`, { ns: "common" })}
                color={option.value}
                onPress={() => toggle(setSelectedColors)(option.value)}
                selected={selectedColors.includes(option.value)}
                style={{ width: colorItemWidth }}
              />
            ))}
          </View>
        </View>

        {/* ── Age range ────────────────────────────────────────────────────── */}
        <View style={styles.section}>
          <InputLabel text={t("petPref.labels.age", { ns: "auth" })} />
          <AgeSlider
            valueMin={selectedAge[0]}
            valueMax={selectedAge[1]}
            onRangeChange={(min, max) => setSelectedAge([min, max])}
          />
        </View>

        {/* ── Save button ──────────────────────────────────────────────────── */}
        <AppButton
          text={t("petPreferences.save", { ns: "profile" })}
          onPress={handleSave}
          loading={loading}
          style={styles.saveButton}
        />

        {!profile?.pet_preferences && (
          <Text
            variant="bodySmall"
            style={[styles.noPrefsHint, { color: colors.outline ?? colors.onSurfaceVariant }]}
          >
            {t("petPreferences.noPrefsHint", { ns: "profile" })}
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scrollView: { flex: 1 },
  container: {
    flexGrow: 1,
    paddingHorizontal: 28,
    rowGap: 16,
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  section: { rowGap: 8 },
  speciesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  genderRow: {
    flexDirection: "row",
    gap: 12,
  },
  genderOption: { flex: 1 },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  saveButton: { marginTop: 8 },
  noPrefsHint: {
    textAlign: "center",
    marginTop: 4,
    opacity: 0.7,
  },
});
