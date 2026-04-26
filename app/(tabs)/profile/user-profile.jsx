import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, I18nManager, ScrollView, StyleSheet, View } from "react-native";
import { Avatar, IconButton, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "react-native-paper";

import LocationInput from "@/src/features/auth/components/LocationInput/LocationInput";
import { useProfile, useUpdateProfile } from "@/src/features/profile/hooks/useProfile";
import { useTranslationLoader } from "@/src/localization/hooks/useTranslationLoader";
import AppButton from "@/src/shared/components/ui/AppButton/AppButton";
import AppInput from "@/src/shared/components/ui/AppInput/AppInput";
import InputLabel from "@/src/shared/components/ui/InputLabel/InputLabel";
import LoadingModal from "@/src/shared/components/ui/LoadingModal/LoadingModal";
import { supabase } from "@/src/shared/services/supabase/client";
import { uploadImage } from "@/src/shared/services/supabase/upload";
import { pickOneImage } from "@/src/shared/utils/pickImages";

export default function UserProfileScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslationLoader("profile");
  const isRTL = I18nManager.isRTL;

  const [userId, setUserId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const [image, setImage] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState(null);
  const [errors, setErrors] = useState({ name: "" });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
    });
  }, []);

  const { data: profile } = useProfile(userId);
  const { mutateAsync: updateProfile, isPending: loading } = useUpdateProfile(userId);

  useEffect(() => {
    if (profile && !isEditing) {
      setName(profile.name ?? "");
      setBio(profile.bio ?? "");
      setPhone(profile.phone ?? "");
      setImage(profile.avatar_url ?? null);
      if (profile.lat && profile.lng) {
        setLocation({ lat: profile.lat, lng: profile.lng, readable: profile.address ?? "" });
      }
    }
  }, [profile]);

  const handleImagePick = async () => {
    const img = await pickOneImage();
    if (img) setImage(img);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setErrors({ name: "Name is required" });
      return;
    }
    setErrors({ name: "" });

    try {
      let avatarUrl = image;
      if (image && !image.startsWith("http")) {
        const result = await uploadImage(image, "avatars", "avatars");
        avatarUrl = result.signedUrl;
      }

      const updates = {
        name: name.trim(),
        bio: bio.trim() || null,
        phone: phone.trim() || null,
        avatar_url: avatarUrl,
        ...(location && {
          lat: location.lat,
          lng: location.lng,
          location: `SRID=4326;POINT(${location.lng} ${location.lat})`,
        }),
      };

      await updateProfile(updates);
      setIsEditing(false);
    } catch (err) {
      console.error("Update error:", err);
      Alert.alert(t("error.title"), t("error.updateFailed"));
    }
  };

  const handleToggleEdit = () => {
    if (isEditing && profile) {
      setName(profile.name ?? "");
      setBio(profile.bio ?? "");
      setPhone(profile.phone ?? "");
      setImage(profile.avatar_url ?? null);
      if (profile.lat && profile.lng) {
        setLocation({ lat: profile.lat, lng: profile.lng, readable: profile.address ?? "" });
      } else {
        setLocation(null);
      }
    }
    setIsEditing((prev) => !prev);
  };

  const handleLocationRetrieved = ({ geoJson, readable }) => {
    setLocation({
      lat: geoJson.coordinates[1],
      lng: geoJson.coordinates[0],
      readable,
    });
  };

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom + 24 },
      ]}
    >
      <LoadingModal loading={loading} />

      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Ionicons
            name={isRTL ? "arrow-forward" : "arrow-back"}
            size={32}
            color={colors.onSurface}
            onPress={() => router.back()}
          />
          <Text variant="headlineLarge" style={{ color: colors.text }}>
            {t("profilePreview.title")}
          </Text>
        </View>
        <IconButton
          icon={isEditing ? "close" : "pencil"}
          onPress={handleToggleEdit}
        />
      </View>

      {/* Avatar */}
      <View style={styles.avatarContainer}>
        <Avatar.Image
          size={150}
          source={
            image
              ? { uri: image }
              : require("@/src/assets/images/avatar-placeholder.png")
          }
          style={styles.avatar}
        />
        {isEditing && (
          <AppButton
            variant="secondary"
            text={t("profilePreview.uploadButton")}
            onPress={handleImagePick}
          />
        )}
      </View>

      {/* Name */}
      <View>
        <InputLabel text={t("profilePreview.name.label")} />
        <AppInput
          placeholder={t("profilePreview.name.placeholder")}
          value={name}
          onChangeText={(text) => {
            setName(text);
            setErrors((prev) => ({ ...prev, name: "" }));
          }}
          disabled={!isEditing}
          error={!!errors.name}
          errorMessage={errors.name}
        />
      </View>

      {/* Bio */}
      <View>
        <InputLabel text={t("profilePreview.bio.label")} />
        <AppInput
          placeholder={t("profilePreview.bio.placeholder")}
          value={bio}
          onChangeText={setBio}
          multiline
          style={{ height: 120 }}
          max={200}
          disabled={!isEditing}
        />
      </View>

      {/* Phone */}
      <View>
        <InputLabel text={t("profilePreview.phone")} />
        <AppInput
          placeholder={t("profilePreview.phonePlaceholder")}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          disabled={!isEditing}
        />
      </View>

      {/* Location */}
      {isEditing && (
        <View>
          <InputLabel text={t("profilePreview.location.label")} />
          <LocationInput onLocationRetrieved={handleLocationRetrieved} />
          {location?.readable ? (
            <Text style={{ color: colors.palette.neutral[500], marginTop: 4, marginStart: 8 }}>
              {location.readable}
            </Text>
          ) : null}
        </View>
      )}

      {!isEditing && location?.readable ? (
        <View>
          <InputLabel text={t("profilePreview.location.label")} />
          <View style={[styles.locationDisplay, { backgroundColor: colors.surface, borderColor: colors.palette.neutral[300] }]}>
            <View style={[styles.locationIconWrap, { backgroundColor: colors.palette.coral[100] }]}>
              <Ionicons name="location-outline" size={18} color={colors.palette.coral[500]} />
            </View>
            <Text style={[styles.locationText, { color: colors.onSurface }]} numberOfLines={2}>
              {location.readable}
            </Text>
          </View>
        </View>
      ) : null}

      {/* Save */}
      {isEditing && (
        <View style={styles.actions}>
          <AppButton text={t("profilePreview.submit")} onPress={handleSubmit} />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    gap: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
    marginTop: 12,
  },
  avatarContainer: {
    alignItems: "center",
    gap: 12,
    marginVertical: 8,
  },
  avatar: {
    marginBottom: 4,
  },
  actions: {
    marginTop: 8,
  },
  locationDisplay: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginTop: 4,
  },
  locationIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  locationText: {
    fontFamily: "Alexandria_400Regular",
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
});
