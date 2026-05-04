import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { Avatar, Text, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { usePendingReceivedCount } from "@/src/features/pets/hooks/useAdoptionRequest";
import { useProfile } from "@/src/features/profile/hooks/useProfile";
import { useTranslationLoader } from "@/src/localization/hooks/useTranslationLoader";
import NavigationButton from "@/src/shared/components/ui/NavigationButton/NavigationButton";
import { profileMenuOptions } from "@/src/shared/constants/options";
import { supabase } from "@/src/shared/services/supabase/client";

export default function Profile() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslationLoader("profile");

  const [userId, setUserId] = useState(null);
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
      setUserEmail(session?.user?.email ?? null);
    });
  }, []);

  const { data: profile } = useProfile(userId);
  const { data: pendingCount = 0 } = usePendingReceivedCount(userId);

  const confirmLogout = () => {
    Alert.alert(
      t("logoutConfirmation.title"),
      t("logoutConfirmation.message"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.confirm"),
          onPress: handleLogout,
          style: "destructive",
        },
      ],
    );
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.replace("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const tabBarOffset = 96 + Math.max(insets.bottom - 12, 0);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 28, paddingBottom: tabBarOffset + 16 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {profile && (
        <View style={styles.profileContainer}>
          <Avatar.Image
            size={128}
            source={
              profile.avatar_url
                ? { uri: profile.avatar_url }
                : require("@/src/assets/images/avatar-placeholder.png")
            }
          />
          <View style={styles.profileInfo}>
            <Text variant="displayMedium" style={{ color: colors.text }}>
              {profile.name}
            </Text>

            {userEmail ? (
              <View style={styles.metaRow}>
                <Ionicons
                  name="mail-outline"
                  size={14}
                  color={colors.palette.neutral[400]}
                />
                <Text
                  style={[
                    styles.metaText,
                    { color: colors.palette.neutral[500] },
                  ]}
                >
                  {userEmail}
                </Text>
              </View>
            ) : null}

            {profile.address ? (
              <View style={styles.metaRow}>
                <Ionicons
                  name="location-outline"
                  size={14}
                  color={colors.palette.neutral[400]}
                />
                <Text
                  style={[
                    styles.metaText,
                    { color: colors.palette.neutral[500] },
                  ]}
                >
                  {profile.address}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      )}

      <View style={styles.optionsContainer}>
        {profileMenuOptions.map((item) => (
          <NavigationButton
            key={item.id}
            title={t(`menu.${item.titleKey}`)}
            iconName={item.iconName}
            badgeCount={item.showBadge ? pendingCount : 0}
            onPress={() => router.push(item.route)}
          />
        ))}
        <NavigationButton
          key="logout"
          title={t("menu.logout")}
          iconName="log-out-outline"
          onPress={confirmLogout}
          danger
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
  },
  content: {
    alignItems: "center",
    paddingHorizontal: 20,
    gap: 24,
    flexGrow: 1,
  },
  profileContainer: {
    alignItems: "center",
  },
  profileInfo: {
    paddingVertical: 12,
    gap: 6,
    alignItems: "center",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  metaText: {
    fontFamily: "Alexandria_400Regular",
    fontSize: 14,
    lineHeight: 20,
  },
  optionsContainer: {
    gap: 12,
    width: "100%",
  },
});
