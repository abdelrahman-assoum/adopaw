import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, I18nManager, StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useUserPets } from "@/src/features/profile/hooks/useProfile";
import PetCard from "@/src/features/pets/Components/PetCard";
import { useTranslationLoader } from "@/src/localization/hooks/useTranslationLoader";
import { supabase } from "@/src/shared/services/supabase/client";

export default function UserPetsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslationLoader("profile");
  const isRTL = I18nManager.isRTL;

  const [userId, setUserId] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
    });
  }, []);

  const { data: pets = [], isLoading } = useUserPets(userId);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top + 12,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons
            name={isRTL ? "arrow-forward" : "arrow-back"}
            size={32}
            color={colors.onSurface}
            onPress={() => router.back()}
          />
          <Text variant="headlineLarge" style={{ color: colors.text }}>
            {t("myPets.title")}
          </Text>
        </View>
      </View>

      {isLoading ? (
        <ActivityIndicator style={{ flex: 1 }} color={colors.primary} />
      ) : pets.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="paw-outline" size={64} color={colors.palette.neutral[400]} />
          <Text variant="titleLarge" style={{ color: colors.onSurface, textAlign: "center" }}>
            {t("myPets.empty.title")}
          </Text>
          <Text
            variant="bodyMedium"
            style={{ color: colors.palette.neutral[500], textAlign: "center", paddingHorizontal: 32 }}
          >
            {t("myPets.empty.description")}
          </Text>
        </View>
      ) : (
        <FlatList
          data={pets}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.row}
          renderItem={({ item }) => (
            <PetCard
              pet={item}
              status={item.status}
              onPress={() => router.push(`/(tabs)/profile/${item.id}`)}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 12,
  },
  row: {
    gap: 12,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
});
