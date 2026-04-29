import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Avatar, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import LocationInput from "../../src/features/auth/components/LocationInput/LocationInput";
import { createProfile } from "../../src/features/auth/services/profileServices";
import { useTranslationLoader } from "../../src/localization/hooks/useTranslationLoader";
import AppButton from "../../src/shared/components/ui/AppButton/AppButton";
import AppInput from "../../src/shared/components/ui/AppInput/AppInput";
import Heading from "../../src/shared/components/ui/Heading/Heading";
import InputLabel from "../../src/shared/components/ui/InputLabel/InputLabel";
import LoadingModal from "../../src/shared/components/ui/LoadingModal/LoadingModal";
import { STORAGE_KEYS } from "../../src/shared/constants/storageKeys";
import { supabase } from "../../src/shared/services/supabase/client";
import { uploadImage } from "../../src/shared/services/supabase/upload";
import { pickOneImage } from "../../src/shared/utils/pickImages";

export default function ProfileCompleteScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { t } = useTranslationLoader(["auth"]);
  const insets = useSafeAreaInsets();

  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [location, setLocation] = useState(null);
  const [errors, setErrors] = useState({ name: "", location: "" });

  const handleImagePick = async () => {
    const picked = await pickOneImage();
    if (picked) setImage(picked);
  };

  const handleNameBlur = () => {
    const error = name.trim() === "" ? t("profile-c.errors.nameRequired") : "";
    setErrors((prev) => ({ ...prev, name: error }));
  };

  const handleSubmit = async () => {
    const nameError =
      name.trim() === "" ? t("profile-c.errors.nameRequired") : "";
    const locationError = !location
      ? t("profile-c.errors.locationRequired")
      : "";
    setErrors({ name: nameError, location: locationError });
    if (nameError || locationError) return;

    setLoading(true);
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      if (sessionError || !session)
        throw new Error("Failed to retrieve user session.");

      const user = session.user;
      let avatarUrl = null;
      if (image) {
        const { signedUrl } = await uploadImage(image, "avatars");
        avatarUrl = signedUrl;
      }
      const pp = {
        id: user.id,
        name,
        location,
        ...(avatarUrl && { avatarUrl }),
      };
      console.log(pp);
      const profile = await createProfile({
        id: user.id,
        name,
        location,
        ...(avatarUrl && { avatarUrl }),
      });

      await AsyncStorage.setItem(
        STORAGE_KEYS.USER_PROFILE,
        JSON.stringify(profile),
      );
      router.replace("/pet-preferences");
    } catch (error) {
      Alert.alert(t("profile-c.errors.submitFailed"), error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.keyboardView, { backgroundColor: colors.surface }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <LoadingModal loading={loading} />
      <ScrollView
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
          title={t("profile-c.title")}
          description={t("profile-c.description")}
          align="start"
        />
        <View style={styles.avatarContainer}>
          <Avatar.Image
            size={120}
            source={
              image
                ? { uri: image }
                : require("../../src/assets/images/avatar-placeholder.png")
            }
            style={styles.avatar}
          />
          <AppButton
            variant="secondary"
            text={t("profile-c.uploadButton")}
            onPress={handleImagePick}
          />
        </View>
        <View style={styles.section}>
          <InputLabel text={t("profile-c.name.label")} />
          <AppInput
            placeholder={t("profile-c.name.placeholder")}
            value={name}
            onChangeText={(text) => {
              setName(text);
              setErrors((p) => ({ ...p, name: "" }));
            }}
            onBlur={handleNameBlur}
            error={!!errors.name}
            errorMessage={errors.name}
          />
        </View>
        <View style={styles.section}>
          <InputLabel text={t("profile-c.location.label")} />
          <LocationInput
            onLocationRetrieved={({ geoJson }) => {
              setLocation(geoJson);
              setErrors((p) => ({ ...p, location: "" }));
            }}
            error={!!errors.location}
            errorMessage={errors.location}
          />
        </View>
        <AppButton
          text={t("profile-c.submit")}
          onPress={handleSubmit}
          loading={loading}
          style={styles.submitButton}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 28,
    rowGap: 16,
  },
  avatar: { marginBottom: 12 },
  avatarContainer: {
    flexDirection: "column",
    alignItems: "center",
    paddingVertical: 16,
    rowGap: 12,
  },
  section: {
    rowGap: 4,
  },
  submitButton: { width: "100%", marginTop: 8 },
});
