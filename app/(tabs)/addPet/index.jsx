import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { I18nManager, ScrollView, StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";

import PetForm from "@/src/features/pets/Components/PetForm/PetForm";
import { createPet } from "@/src/features/pets/services/petService";
import { useTranslationLoader } from "@/src/localization/hooks/useTranslationLoader";
import { supabase } from "@/src/shared/services/supabase/client";
import { uploadImages } from "@/src/shared/services/supabase/upload";
import LoadingModal from "@/src/shared/components/ui/LoadingModal/LoadingModal";

export default function AddPetScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { t } = useTranslationLoader("addPet");
  const isRTL = I18nManager.isRTL;

  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [formKey, setFormKey] = useState(0);
  const scrollRef = useRef(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
    });
  }, []);

  const handleSubmit = async (formData) => {
    if (!userId) return;
    setLoading(true);
    try {
      // Upload all new images
      const uploaded = await uploadImages(formData.images, "pet-images", "pet");
      const imageUrls = uploaded.map((u) => u.signedUrl);

      await createPet({
        posted_by:     userId,
        name:          formData.name,
        species:       formData.species,
        breed:         formData.breed,
        gender:        formData.gender,
        age_value:     formData.age_value,
        age_unit:      formData.age_unit,
        color:         formData.color,
        size:          formData.size,
        activity_level: formData.activity_level,
        description:   formData.description,
        sterilized:    formData.sterilized,
        vaccinated:    formData.vaccinated,
        dewormed:      formData.dewormed,
        has_passport:  formData.has_passport,
        special_needs: formData.special_needs,
        images:        imageUrls,
        status:        "available",
        lat:           formData.lat,
        lng:           formData.lng,
      });

      await queryClient.invalidateQueries({ queryKey: ["pets"] });
      setFormKey((k) => k + 1);
      scrollRef.current?.scrollTo({ y: 0, animated: false });
      router.replace("/(tabs)/home");
    } catch (error) {
      console.error("Error creating pet:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      ref={scrollRef}
      contentContainerStyle={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          paddingBottom: insets.bottom + 12,
          paddingTop: insets.top,
          paddingHorizontal: 24,
        },
      ]}
      style={{ backgroundColor: theme.colors.surface }}
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
          {t("title")}
        </Text>
      </View>

      <PetForm key={formKey} onSubmit={handleSubmit} loading={loading} isEditing={false} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  heading: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 20 },
});
