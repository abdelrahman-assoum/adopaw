import { useRouter } from "expo-router";
import { useState } from "react";
import { Dimensions, ScrollView, StyleSheet, View } from "react-native";
import { useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const H_PAD = 28 * 2;
const AVAILABLE_WIDTH = SCREEN_WIDTH - H_PAD;
const SPECIES_COLS = 3;
const speciesCardWidth = Math.floor(
  (AVAILABLE_WIDTH - 8 * (SPECIES_COLS - 1)) / SPECIES_COLS,
);
const COLOR_COLS = 4;
const colorItemWidth = Math.floor((AVAILABLE_WIDTH - 8 * (COLOR_COLS - 1)) / COLOR_COLS);

import { formatAgeRange } from "../../src/features/auth/utils/age-range";
import { updatePetPreferences } from "../../src/features/auth/services/profileServices";
import { useTranslationLoader } from "../../src/localization/hooks/useTranslationLoader";
import AgeSlider from "../../src/shared/components/ui/AgeSlider/AgeSlider";
import AppButton from "../../src/shared/components/ui/AppButton/AppButton";
import ColorSelectOption from "../../src/shared/components/ui/ColorSelectOption/ColorSelectOption";
import SelectOption from "../../src/shared/components/ui/CustomSelect/SelectOption";
import Heading from "../../src/shared/components/ui/Heading/Heading";
import InputLabel from "../../src/shared/components/ui/InputLabel/InputLabel";
import LoadingModal from "../../src/shared/components/ui/LoadingModal/LoadingModal";
import { animalOptions } from "../../src/shared/constants/animals";
import { animalsColors, gender } from "../../src/shared/constants/prefs";
import { supabase } from "../../src/shared/services/supabase/client";

export default function PetPreferencesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslationLoader(["auth", "common"]);

  const [selectedSpecies, setSelectedSpecies] = useState([]);
  const [selectedGenders, setSelectedGenders] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedAge, setSelectedAge] = useState([0.083, 15]);
  const [loading, setLoading] = useState(false);

  const toggleSpeciesSelection = (value) => {
    setSelectedSpecies((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  };

  const toggleColorsSelection = (value) => {
    setSelectedColors((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  };

  const toggleGenderSelection = (value) => {
    setSelectedGenders((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  };

  const skip = () => {
    router.replace("/(tabs)/home");
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const supaId = session.user.id;
      const petPreferences = {
        species: selectedSpecies,
        gender: selectedGenders,
        ageRange: formatAgeRange(selectedAge),
        colors: selectedColors,
      };

      await updatePetPreferences(supaId, petPreferences);
      router.replace("/(tabs)/home");
    } catch (error) {
      console.error("Error updating pet preferences:", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: colors.surface }]}
      contentContainerStyle={[
        styles.container,
        {
          paddingTop: insets.top + 40,
          paddingBottom: Math.max(insets.bottom + 24, 40),
        },
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <Heading
        title={t("petPref.title")}
        description={t("petPref.description")}
        align="start"
      />
      <LoadingModal loading={loading} />

      <View style={styles.section}>
        <InputLabel text={t("petPref.labels.specie")} />
        <View style={styles.speciesGrid}>
          {animalOptions.map((option) => (
            <SelectOption
              key={option.value}
              label={t(option.labelKey, { ns: "common" })}
              image={option.image}
              selected={selectedSpecies.includes(option.value)}
              onPress={() => toggleSpeciesSelection(option.value)}
              style={{ width: speciesCardWidth }}
            />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <InputLabel text={t("petPref.labels.gender")} />
        <View style={styles.genderRow}>
          {gender.map((option) => (
            <SelectOption
              key={option.value}
              label={t(`gender.${option.value}`, { ns: "common" })}
              icon={option.iconName}
              iconColor={option.iconColor}
              selected={selectedGenders.includes(option.value)}
              onPress={() => toggleGenderSelection(option.value)}
              style={styles.genderOption}
            />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <InputLabel text={t("petPref.labels.color")} />
        <View style={styles.colorGrid}>
          {animalsColors.map((option) => (
            <ColorSelectOption
              key={option.value}
              label={t(`colors.${option.label}`, { ns: "common" })}
              color={option.value}
              onPress={() => toggleColorsSelection(option.value)}
              selected={selectedColors.includes(option.value)}
              style={{ width: colorItemWidth }}
            />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <InputLabel text={t("petPref.labels.age")} />
        <AgeSlider
          valueMin={selectedAge[0]}
          valueMax={selectedAge[1]}
          onRangeChange={(min, max) => setSelectedAge([min, max])}
        />
      </View>

      <View style={styles.buttonsContainer}>
        <AppButton
          variant="secondary"
          text={t("petPref.skip")}
          onPress={skip}
          style={{ flex: 1, width: "auto" }}
        />
        <AppButton
          text={t("petPref.submit")}
          onPress={handleSubmit}
          style={{ flex: 1, width: "auto" }}
          loading={loading}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 28,
    rowGap: 16,
  },
  section: {
    rowGap: 8,
  },
  speciesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  genderRow: {
    flexDirection: "row",
    gap: 12,
  },
  genderOption: {
    flex: 1,
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  buttonsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginTop: 8,
  },
});
