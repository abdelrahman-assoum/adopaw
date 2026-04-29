import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  I18nManager,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { IconButton, Text, useTheme } from "react-native-paper";

import PetAgeInput from "@/src/features/addPet/Components/AgeInput/AgeInput";
import BreedSelect from "@/src/features/addPet/Components/BreedSelect/BreedSelect";
import ColorSelect from "@/src/features/addPet/Components/ColorSelect/ColorSelect";
import MapPicker from "@/src/features/addPet/Components/MapPicker/MapPicker";
import MapPickerModal from "@/src/features/addPet/Components/MapPicker/MapPickerModal";
import PetHealthCheckboxes from "@/src/features/addPet/Components/PetHealthCheckboxes/PetHealthCheckboxes";
import SpecieSelect from "@/src/features/addPet/Components/SpecieSelect/SpecieSelect";
import StandardSelect from "@/src/features/addPet/Components/StandardSelect/StandardSelect";
import { useTranslationLoader } from "@/src/localization/hooks/useTranslationLoader";
import AppButton from "@/src/shared/components/ui/AppButton/AppButton";
import AppInput from "@/src/shared/components/ui/AppInput/AppInput";
import InputLabel from "@/src/shared/components/ui/InputLabel/InputLabel";
import SelectOption from "@/src/shared/components/ui/CustomSelect/SelectOption";
import LocationInput from "@/src/features/auth/components/LocationInput/LocationInput";
import { gender, activityOption, sizeOptions } from "@/src/shared/constants/prefs";
import { pickMultipleImages } from "@/src/shared/utils/pickImages";


// sizeOptions in prefs.js uses "big", Supabase schema uses "large" — normalise here
const SIZE_OPTIONS = sizeOptions.map((o) =>
  o.value === "big" ? { ...o, value: "large" } : o
);

export default function PetForm({ initialData = null, onSubmit, isEditing = false, loading = false }) {
  const theme = useTheme();
  const { t } = useTranslationLoader(["addPet"]);
  const isRTL = I18nManager.isRTL;
  const { colors: ThemeColors } = theme;

  const [images, setImages]               = useState(initialData?.images ?? []);
  const [mainImage, setMainImage]         = useState(initialData?.images?.[0] ?? null);
  const [name, setName]                   = useState(initialData?.name ?? "");
  const [description, setDescription]     = useState(initialData?.description ?? "");
  const [specie, setSpecie]               = useState(initialData?.species ?? null);
  const [breed, setBreed]                 = useState(initialData?.breed ?? null);
  const [colors, setColors]               = useState(initialData?.color ?? []);
  const [age, setAge]                     = useState({ value: String(initialData?.age_value ?? ""), unit: initialData?.age_unit ?? "" });
  const [size, setSize]                   = useState(initialData?.size ?? null);
  const [activity, setActivity]           = useState(initialData?.activity_level ?? null);
  const [selectedGender, setGender]       = useState(initialData?.gender ?? null);
  const [health, setHealth]               = useState({
    sterilized:   initialData?.sterilized   ?? false,
    vaccinated:   initialData?.vaccinated   ?? false,
    dewormed:     initialData?.dewormed     ?? false,
    hasPassport:  initialData?.has_passport ?? false,
    specialNeeds: initialData?.special_needs ?? false,
  });
  const [location, setLocation]           = useState(
    initialData?.lat != null
      ? { geoJson: { type: "Point", coordinates: [initialData.lng, initialData.lat] }, readable: "" }
      : null
  );
  const [modalVisible, setModalVisible]   = useState(false);
  const [removedImages, setRemovedImages] = useState([]);
  const [errors, setErrors]               = useState({});

  const handlePickImages = async () => {
    const picked = await pickMultipleImages();
    if (picked.length > 0) {
      const next = [...images, ...picked].slice(0, 8);
      setImages(next);
      if (!mainImage) setMainImage(next[0]);
    }
  };

  const handleRemoveImage = (uri) => {
    const filtered = images.filter((img) => img !== uri);
    setImages(filtered);
    if (isEditing && initialData?.images?.includes(uri)) {
      setRemovedImages((prev) => [...prev, uri]);
    }
    if (mainImage === uri) setMainImage(filtered[0] ?? null);
  };

  const validateForm = () => {
    const e = {};
    if (!images.length)    e.images   = t("errors.imagesRequired");
    if (!name.trim())      e.name     = t("errors.nameRequired");
    if (!specie)           e.specie   = t("errors.specieRequired");
    if (!colors.length)    e.colors   = t("errors.colorRequired");
    if (!age.value)        e.age      = t("errors.ageRequired");
    if (!age.unit)         e.age      = t("errors.ageUnitRequired");
    if (!size)             e.size     = t("errors.sizeRequired");
    if (!activity)         e.activity  = t("errors.activityRequired");
    if (!selectedGender)   e.gender   = t("errors.genderRequired");
    if (!location)         e.location = t("errors.locationRequired");
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    onSubmit({
      images,
      removedImages: isEditing ? removedImages : [],
      name: name.trim(),
      description,
      species: specie,
      breed: breed ?? "",
      color: colors,
      age_value:      Number(age.value) || 0,
      age_unit:       age.unit,
      size,
      activity_level: activity,
      gender: selectedGender,
      sterilized:    health.sterilized,
      vaccinated:    health.vaccinated,
      dewormed:      health.dewormed,
      has_passport:  health.hasPassport,
      special_needs: health.specialNeeds,
      lat: location?.geoJson.coordinates[1],
      lng: location?.geoJson.coordinates[0],
    });
  };

  const ErrorText = ({ field }) =>
    errors[field] ? (
      <Text style={[styles.errorText, { color: ThemeColors.palette.error[500] }]}>
        {errors[field]}
      </Text>
    ) : null;

  return (
    <View style={{ flex: 1 }}>
      {/* Main image */}
      {mainImage ? (
        <Image source={{ uri: mainImage }} style={styles.mainImage} />
      ) : (
        <TouchableOpacity
          style={[styles.addBox, { borderColor: theme.colors.outline, backgroundColor: ThemeColors.surface }]}
          onPress={handlePickImages}
        >
          <Ionicons name="image" size={36} color={ThemeColors.onSurface} />
          <Text style={{ color: ThemeColors.onSurface }}>{t("imagePick")}</Text>
        </TouchableOpacity>
      )}
      <ErrorText field="images" />

      {/* Thumbnails */}
      {images.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbRow}>
          {images.map((uri) => (
            <View key={uri} style={styles.thumbWrapper}>
              <TouchableOpacity onPress={() => setMainImage(uri)}>
                <Image source={{ uri }} style={styles.thumbnail} />
              </TouchableOpacity>
              <IconButton icon="close" size={12} style={styles.deleteIcon} onPress={() => handleRemoveImage(uri)} />
            </View>
          ))}
          {images.length < 8 && (
            <TouchableOpacity style={[styles.thumbAdd, { borderColor: theme.colors.outline }]} onPress={handlePickImages}>
              <IconButton icon="plus" size={20} />
            </TouchableOpacity>
          )}
        </ScrollView>
      )}

      {/* Name */}
      <View>
        <InputLabel text={t("inputs.name.label")} />
        <AppInput value={name} onChangeText={setName} style={{ height: 50 }} />
        <ErrorText field="name" />
      </View>

      {/* Description */}
      <View>
        <InputLabel text={t("inputs.description.label")} />
        <AppInput value={description} onChangeText={setDescription} multiline max={120} style={{ height: 120 }} />
      </View>

      {/* Species + Breed */}
      <View style={{ flexDirection: "row", gap: 12, paddingVertical: 12 }}>
        <View style={{ flex: 1 }}>
          <InputLabel text={t("inputs.specie.label")} />
          <SpecieSelect value={specie} onChange={setSpecie} />
          <ErrorText field="specie" />
        </View>
        <View style={{ flex: 1 }}>
          <InputLabel text={t("inputs.breed.label")} />
          <BreedSelect specie={specie} value={breed} onChange={setBreed} />
        </View>
      </View>

      {/* Colors */}
      <View>
        <InputLabel text={t("inputs.color.label")} />
        <ColorSelect value={colors} onChange={setColors} />
        <ErrorText field="colors" />
      </View>

      {/* Age */}
      <View>
        <InputLabel text={t("inputs.age.label")} />
        <PetAgeInput age={age} onChange={setAge} />
        <ErrorText field="age" />
      </View>

      {/* Size + Activity */}
      <View style={{ flexDirection: "row", gap: 12, paddingVertical: 12 }}>
        <View style={{ flex: 1 }}>
          <InputLabel text={t("inputs.size.label")} />
          <StandardSelect
            data={SIZE_OPTIONS}
            value={size}
            onChange={setSize}
            placeholderKey="inputs.size.placeholder"
            translationNamespace="addPet"
            labelKey="inputs.size"
          />
          <ErrorText field="size" />
        </View>
        <View style={{ flex: 1 }}>
          <InputLabel text={t("inputs.activity.label")} />
          <StandardSelect
            data={activityOption}
            value={activity}
            onChange={setActivity}
            placeholderKey="inputs.activity.placeholder"
            translationNamespace="addPet"
            labelKey="inputs.activity"
          />
          <ErrorText field="activity" />
        </View>
      </View>

      {/* Gender */}
      <View>
        <InputLabel text={t("inputs.gender.label")} />
        <View style={{ flexDirection: "row", gap: 12 }}>
          {gender.map((option) => (
            <SelectOption
              key={option.value}
              label={t(`gender.${option.value}`, { ns: "common" })}
              icon={option.iconName}
              iconColor={option.iconColor}
              selected={selectedGender === option.value}
              onPress={() => setGender(option.value)}
              style={{ flex: 1 }}
            />
          ))}
        </View>
        <ErrorText field="gender" />
      </View>

      {/* Health */}
      <View>
        <InputLabel text={t("inputs.health.label")} />
        <PetHealthCheckboxes values={health} onChange={setHealth} />
      </View>

      {/* Location */}
      <View>
        <InputLabel text={t("location.label", { ns: "common" })} />
        {location && (
          <View style={styles.locationPreview}>
            <Ionicons name="location-outline" size={20} color={ThemeColors.onSurface} />
            <Text variant="bodyMedium" style={{ flex: 1, marginStart: 8 }}>
              {location.readable || "Location set"}
            </Text>
            <TouchableOpacity onPress={() => setModalVisible(true)} style={[styles.locBtn, { backgroundColor: theme.colors.primary }]}>
              <Ionicons name="pencil" size={16} color={ThemeColors.surface} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setLocation(null)} style={[styles.locBtn, { backgroundColor: theme.colors.error, marginStart: 8 }]}>
              <Ionicons name="trash" size={16} color={ThemeColors.surface} />
            </TouchableOpacity>
          </View>
        )}
        <LocationInput onLocationRetrieved={(loc) => setLocation(loc)} />
        <MapPicker onPress={() => setModalVisible(true)} />
        <MapPickerModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onSubmit={(loc) => setLocation(loc)}
        />
        <ErrorText field="location" />
      </View>

      {/* Submit */}
      <View style={{ marginVertical: 12 }}>
        <AppButton text={isEditing ? t("update") : t("submit")} onPress={handleSubmit} loading={loading} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  addBox: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 8,
    height: 220,
    justifyContent: "center",
    alignItems: "center",
  },
  mainImage: { width: "100%", height: 220, borderRadius: 8 },
  thumbRow: { marginTop: 8, flexDirection: "row" },
  thumbWrapper: { position: "relative", marginRight: 8 },
  thumbnail: { width: 60, height: 60, borderRadius: 8 },
  deleteIcon: { position: "absolute", top: -6, right: -6, backgroundColor: "white" },
  thumbAdd: {
    width: 60,
    height: 60,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: { marginVertical: 4, fontSize: 12 },
  locationPreview: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    marginBottom: 4,
    gap: 4,
  },
  locBtn: { padding: 12, borderRadius: 8, alignItems: "center" },
});
