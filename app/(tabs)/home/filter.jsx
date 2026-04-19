import Slider from "@react-native-community/slider";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import PetsCategories from "@/src/features/home/components/PetsCategories";
import { useTranslationLoader } from "@/src/localization/hooks/useTranslationLoader";
import AppButton from "@/src/shared/components/ui/AppButton/AppButton";

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
  };

  const handleApply = () => {
    router.push({
      pathname: "/(tabs)/home",
      params: {
        species:  selectedCategory.join(","),
        age:      selectedAge.join(","),
        size:     selectedSize.join(","),
        gender:   selectedGender.join(","),
        activity: selectedActivity.join(","),
        distance: String(distance),
      },
    });
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
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
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
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
