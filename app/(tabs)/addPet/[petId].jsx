import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { I18nManager, ScrollView, StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";

import PetForm from "@/src/features/pets/Components/PetForm/PetForm";
import { updatePet } from "@/src/features/pets/services/petService";
import { usePet } from "@/src/features/home/hooks/usePets";
import { useTranslationLoader } from "@/src/localization/hooks/useTranslationLoader";
import { deleteImage, uploadImages } from "@/src/shared/services/supabase/upload";
import LoadingModal from "@/src/shared/components/ui/LoadingModal/LoadingModal";

export default function EditPetScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { petId } = useLocalSearchParams();
  const queryClient = useQueryClient();
  const { t } = useTranslationLoader("addPet");
  const isRTL = I18nManager.isRTL;

  const [loading, setLoading] = useState(false);
  const { data: pet, isLoading, error } = usePet(petId);

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      // Delete removed images from Supabase Storage
      for (const url of formData.removedImages) {
        const match = url.match(/\/object\/sign\/([^/]+)\/(.+)\?/);
        if (match) {
          await deleteImage(match[1], match[2]).catch(() => {});
        }
      }

      // Upload new images (local URIs); keep existing ones that start with http
      const uploadedUrls = [];
      const newUris = formData.images.filter((u) => !u.startsWith("http"));
      const existingUrls = formData.images.filter((u) => u.startsWith("http"));

      if (newUris.length > 0) {
        const uploaded = await uploadImages(newUris, "pets", "pet-images");
        uploadedUrls.push(...uploaded.map((u) => u.signedUrl));
      }

      await updatePet(petId, {
        name:           formData.name,
        species:        formData.species,
        breed:          formData.breed,
        gender:         formData.gender,
        age_value:      formData.age_value,
        age_unit:       formData.age_unit,
        color:          formData.color,
        size:           formData.size,
        activity_level: formData.activity_level,
        description:    formData.description,
        sterilized:     formData.sterilized,
        vaccinated:     formData.vaccinated,
        dewormed:       formData.dewormed,
        has_passport:   formData.has_passport,
        special_needs:  formData.special_needs,
        images:         [...existingUrls, ...uploadedUrls],
        lat:            formData.lat,
        lng:            formData.lng,
      });

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["pet", petId] }),
        queryClient.invalidateQueries({ queryKey: ["pets"] }),
      ]);

      router.replace(`/(tabs)/home/${petId}`);
    } catch (err) {
      console.error("Error updating pet:", err);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.surface }]}>
        <Text style={{ padding: 16 }}>{t("loading")}</Text>
      </View>
    );
  }

  if (error || !pet) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.surface }]}>
        <Text style={{ padding: 16, color: theme.colors.error }}>{t("error")}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          paddingBottom: insets.bottom + 12,
          paddingTop: insets.top,
          paddingHorizontal: 24,
        },
      ]}
    >
      <LoadingModal loading={loading} />
      <View style={styles.heading}>
        <Ionicons
          name={isRTL ? "arrow-forward" : "arrow-back"}
          size={32}
          color={theme.colors.onSurface}
          onPress={() => router.back()}
        />
        <Text variant="headlineLarge" style={{ color: theme.colors.text }}>
          {t("editTitle")}
        </Text>
      </View>

      <PetForm initialData={pet} onSubmit={handleSubmit} loading={loading} isEditing />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  heading: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 20 },
  center: { flex: 1 },
});
