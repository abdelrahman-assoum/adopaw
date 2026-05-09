import { useLocalSearchParams, useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import FilterButton from "@/src/features/home/components/FilterButton";
import PetsCategories from "@/src/features/home/components/PetsCategories";
import SearchBar from "@/src/features/home/components/SearchBar";
import { usePets } from "@/src/features/home/hooks/usePets";
import { formatDistance, getDistanceKm } from "@/src/features/home/utils/distance";
import { useProfile } from "@/src/features/profile/hooks/useProfile";
import PetCard from "@/src/features/pets/Components/PetCard";
import { useTranslationLoader } from "@/src/localization/hooks/useTranslationLoader";
import { supabase } from "@/src/shared/services/supabase/client";

const FILTER_KEYS = ["species", "gender", "size", "activity", "age"];
const parseParam = (val) => (val ? val.split(",").filter(Boolean) : []);

export default function Home() {
  const theme = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { t } = useTranslationLoader("home");
  const params = useLocalSearchParams();

  const [userId, setUserId] = useState(null);
  const [searchQuery, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
    });
  }, []);

  const { data: profile } = useProfile(userId);

  const filters = useMemo(() => ({
    species:        selectedCategory ? [selectedCategory] : parseParam(params.species),
    gender:         parseParam(params.gender),
    size:           parseParam(params.size),
    activity_level: parseParam(params.activity),
    age:            parseParam(params.age),
    search:         searchQuery.trim() || null,
    hideOwnPets:    params.hideOwnPets === "true",
    userId,
  }), [selectedCategory, params, searchQuery, userId]);

  const activeCount = FILTER_KEYS.filter((k) => params[k] && params[k] !== "").length;

  const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage, refetch } = usePets(filters);
  const pets = useMemo(() => data?.pages.flat() ?? [], [data]);

  const userLat = profile?.lat;
  const userLng = profile?.lng;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={{ color: theme.colors.onSurface, marginBottom: 4 }} variant="bodyLarge">
          {t("greeting", { userName: profile?.name ?? "" })}
        </Text>
        <Text style={{ color: theme.colors.text }} variant="displayLarge">
          {t("mainMessage")}
        </Text>

        <View style={styles.searchRow}>
          <SearchBar value={searchQuery} onChangeText={setSearch} style={{ flex: 1 }} />
          <FilterButton style={styles.filterButton} activeCount={activeCount} currentParams={params} />
        </View>

        <PetsCategories
          selected={selectedCategory}
          onSelect={setSelectedCategory}
          style={{ marginTop: 8, marginBottom: 12 }}
        />
      </View>

      <FlatList
        data={pets}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        renderItem={({ item }) => {
          const distanceText =
            userLat != null && item.lat != null
              ? formatDistance(getDistanceKm(userLat, userLng, item.lat, item.lng))
              : undefined;
          return (
            <PetCard
              pet={item}
              distanceText={distanceText}
              onPress={() => {
                queryClient.setQueryData(["pet", item.id], item);
                router.push(`/(tabs)/home/${item.id}`);
              }}
            />
          );
        }}
        refreshing={isFetching && !data}
        onRefresh={refetch}
        onEndReached={() => hasNextPage && !isFetchingNextPage && fetchNextPage()}
        onEndReachedThreshold={0.4}
        ListEmptyComponent={
          !isFetching ? <Text style={styles.emptyText}>{t("noPets")}</Text> : null
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator style={styles.footer} color={theme.colors.primary} />
          ) : null
        }
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingTop: 16 },
  searchRow: { flexDirection: "row", alignItems: "center", marginTop: 16 },
  filterButton: { marginLeft: 8 },
  columnWrapper: { justifyContent: "space-between", marginBottom: 0 },
  listContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 110 },
  emptyText: { textAlign: "center", marginTop: 24 },
  footer: { marginVertical: 16 },
});
