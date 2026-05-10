import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Keyboard,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import { Text, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import CategoryChips from "@/src/features/map/components/CategoryChips";
import PetBottomCard from "@/src/features/map/components/PetBottomCard";
import PetMarker from "@/src/features/map/components/PetMarker";
import PlaceMarker from "@/src/features/map/components/PlaceMarker";
import PlacesBottomSheet from "@/src/features/map/components/PlacesBottomSheet";
import { useCurrentLocation } from "@/src/features/map/hooks/useCurrentLocation";
import { usePlaces } from "@/src/features/map/hooks/usePlaces";
import { getBoundsFromRegion, usePetsInBounds } from "@/src/features/map/hooks/usePetsInBounds";
import { useTranslationLoader } from "@/src/localization/hooks/useTranslationLoader";

const SCREEN_H = Dimensions.get("window").height;

export default function MapPage() {
  const { t } = useTranslationLoader("map");
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { region, setRegion, userLocation, loading: locationLoading, recenter } = useCurrentLocation();
  const { focusPlaceId, focusLat, focusLng } = useLocalSearchParams();

  const [mapReady, setMapReady] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [selectedPet, setSelectedPet] = useState(null);
  const [overlayHeight, setOverlayHeight] = useState(0);
  const [keyboardHeight, setKeyboardHeight]     = useState(0);
  const [keyboardDuration, setKeyboardDuration] = useState(250);
  const keyboardVisible = keyboardHeight > 0;

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const show = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates.height);
      if (e.duration) setKeyboardDuration(e.duration);
    });
    const hide = Keyboard.addListener(hideEvent, (e) => {
      setKeyboardHeight(0);
      if (e.duration) setKeyboardDuration(e.duration);
    });
    return () => { show.remove(); hide.remove(); };
  }, []);

  // ─── Pets on map ──────────────────────────────────────────────────────────────
  const [showPets, setShowPets] = useState(false);
  // Set of pet IDs whose first image has been prefetched and is ready to render
  const [readyPetIds, setReadyPetIds] = useState(new Set());

  const bounds = useMemo(() => getBoundsFromRegion(region), [region]);
  const { data: petsInBounds = [], isFetching: fetchingPets } = usePetsInBounds(bounds, showPets);

  // Prefetch images progressively — markers appear as each image resolves
  useEffect(() => {
    if (!showPets || !petsInBounds.length) {
      setReadyPetIds(new Set());
      return;
    }

    setReadyPetIds(new Set());
    let cancelled = false;

    petsInBounds.forEach(async (pet) => {
      const url = pet.images?.[0];
      // Even if there's no image or prefetch fails, still show the marker
      if (url) {
        try { await Image.prefetch(url); } catch { /* ignore */ }
      }
      if (!cancelled) {
        setReadyPetIds((prev) => new Set([...prev, pet.id]));
      }
    });

    return () => { cancelled = true; };
  }, [petsInBounds, showPets]);

  const renderedPets = useMemo(
    () => petsInBounds.filter((p) => readyPetIds.has(p.id)),
    [petsInBounds, readyPetIds]
  );

  // ─── Layout helpers ───────────────────────────────────────────────────────────
  const onMapReady = useCallback(() => setMapReady(true), []);
  const onOverlayLayout = useCallback((e) => {
    setOverlayHeight(e.nativeEvent.layout.height);
  }, []);

  const tabBarOffset = 64 + Math.max(insets.bottom - 12, 0);
  const maxSheetHeight = overlayHeight > 0
    ? SCREEN_H - overlayHeight - tabBarOffset - 32
    : 360;

  // When keyboard is open the sheet bottom stays fixed; the keyboard covers
  // (keyboardHeight - tabBarOffset) px of the sheet from below, so we need
  // the sheet to be that much taller to expose ~220 px of content above it.
  const keyboardSnapHeight = keyboardVisible
    ? Math.min(keyboardHeight - tabBarOffset + 220, maxSheetHeight)
    : undefined;

  // ─── Places ───────────────────────────────────────────────────────────────────
  const { data: places = [], isFetching: loadingPlaces } = usePlaces(region);

  // Focus a specific place when navigated from Pawlo suggestion card
  useEffect(() => {
    if (!focusPlaceId || !places.length) return;
    const place = places.find((p) => p.id === focusPlaceId);
    if (!place) return;
    setSelectedPet(null);
    setSelectedPlace(place);
    if (focusLat && focusLng) {
      setRegion((prev) => ({
        ...prev,
        latitude: parseFloat(focusLat),
        longitude: parseFloat(focusLng),
        latitudeDelta: 0.008,
        longitudeDelta: 0.008,
      }));
    }
  }, [focusPlaceId, places]); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredPlaces = useMemo(() => {
    let result = places;
    if (selectedCategory) result = result.filter((p) => p.category === selectedCategory);
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      );
    }
    if (userLocation) {
      const { latitude: uLat, longitude: uLng } = userLocation;
      result = [...result].sort((a, b) => {
        const da = (a.latitude - uLat) ** 2 + (a.longitude - uLng) ** 2;
        const db = (b.latitude - uLat) ** 2 + (b.longitude - uLng) ** 2;
        return da - db;
      });
    }
    return result;
  }, [places, selectedCategory, searchQuery, userLocation]);

  // ─── Interaction handlers ─────────────────────────────────────────────────────
  const skipNextMapPress = useRef(false);

  const handleMarkerPress = useCallback((place) => {
    setSelectedPet(null);
    setSelectedPlace((prev) => {
      if (prev?.id === place.id) return null;
      skipNextMapPress.current = true;
      setTimeout(() => { skipNextMapPress.current = false; }, 300);
      return place;
    });
  }, []);

  const handlePetMarkerPress = useCallback((pet) => {
    setSelectedPlace(null);
    setSelectedPet((prev) => {
      skipNextMapPress.current = true;
      setTimeout(() => { skipNextMapPress.current = false; }, 300);
      return prev?.id === pet.id ? null : pet;
    });
  }, []);

  const handleMapPress = useCallback(() => {
    if (skipNextMapPress.current) { skipNextMapPress.current = false; return; }
    Keyboard.dismiss();
    setSelectedPlace(null);
    setSelectedPet(null);
  }, []);

  const handleClearSelection = useCallback(() => setSelectedPlace(null), []);

  const handleTogglePets = useCallback(() => {
    setShowPets((v) => !v);
    setSelectedPet(null);
  }, []);

  // ─── Theme helpers ────────────────────────────────────────────────────────────
  const inputBg     = theme.colors.surface;
  const inputBorder = theme.dark ? "rgba(255,255,255,0.12)" : "rgba(169,169,169,0.5)";
  const iconColor   = theme.dark ? theme.colors.placeholder : "#A9A9A9";
  const textColor   = theme.colors.onSurface;

  return (
    <View style={styles.container}>
      <MapView
        style={StyleSheet.absoluteFill}
        provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
        initialRegion={region}
        region={region}
        onRegionChangeComplete={setRegion}
        showsUserLocation
        showsMyLocationButton={false}
        moveOnMarkerPress={false}
        onMapReady={onMapReady}
        onPress={handleMapPress}
      >
        {mapReady && (selectedPlace ? [selectedPlace] : filteredPlaces).map((place) => (
          <PlaceMarker
            key={place.id}
            place={place}
            onPress={handleMarkerPress}
            selected={selectedPlace?.id === place.id}
          />
        ))}

        {mapReady && showPets && !searchQuery && renderedPets.map((pet) => (
          <PetMarker
            key={pet.id}
            pet={pet}
            onPress={handlePetMarkerPress}
            selected={selectedPet?.id === pet.id}
          />
        ))}
      </MapView>

      {/* Top overlay */}
      <View
        style={[styles.topOverlay, { paddingTop: insets.top + 8 }]}
        onLayout={onOverlayLayout}
      >
        <View style={styles.searchRow}>
          <View style={[styles.searchInput, { backgroundColor: inputBg, borderColor: inputBorder }]}>
            <Ionicons name="search-outline" size={16} color={iconColor} />
            <TextInput
              style={[styles.searchText, { color: textColor }]}
              placeholder={t("search.placeholder")}
              placeholderTextColor={iconColor}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons name="close" size={16} color={iconColor} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={[styles.recenterBtn, { backgroundColor: inputBg, borderColor: inputBorder }]}
            onPress={recenter}
          >
            <Ionicons name="navigate" size={16} color={textColor} />
          </TouchableOpacity>
        </View>

        <CategoryChips selected={selectedCategory} onSelect={setSelectedCategory} />
      </View>

      {locationLoading && (
        <View style={styles.loadingBadge}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
        </View>
      )}

      {/* Pets count badge — shown while pet mode is on */}
      {/* {showPets && !fetchingPets && (
        <View style={[styles.petsBadge, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.petsBadgeText, { color: theme.colors.onSurface }]}>
            {petsInBounds.length > 0
              ? t("petsFound", { count: petsInBounds.length })
              : t("noPetsFound")}
          </Text>
        </View>
      )} */}

      {/* Pets loading indicator */}
      {/* {showPets && fetchingPets && (
        <View style={[styles.petsBadge, { backgroundColor: theme.colors.surface }]}>
          <ActivityIndicator size="small" color={theme.colors.primary} style={{ marginRight: 6 }} />
          <Text style={[styles.petsBadgeText, { color: theme.colors.onSurface }]}>
            {t("showPets")}
          </Text>
        </View>
      )} */}

      {/* Paw FAB toggle */}
      <TouchableOpacity
        style={[
          styles.pawFab,
          {
            backgroundColor: showPets ? theme.colors.primary : theme.colors.surface,
            borderColor: showPets ? theme.colors.primary : inputBorder,
            top: overlayHeight > 0 ? overlayHeight + 8 : 120,
          },
        ]}
        onPress={handleTogglePets}
        activeOpacity={0.85}
      >
        <Ionicons
          name="paw"
          size={22}
          color={showPets ? "#fff" : theme.colors.primary}
        />
      </TouchableOpacity>

      <PlacesBottomSheet
        places={filteredPlaces}
        loading={loadingPlaces}
        selectedPlace={selectedPlace}
        onClearSelection={handleClearSelection}
        onSelectPlace={handleMarkerPress}
        maxHeight={maxSheetHeight}
        tabBarOffset={tabBarOffset}
        compact={!!selectedPet}
        keyboardOpen={keyboardVisible}
        keyboardSnapHeight={keyboardSnapHeight}
        keyboardAnimDuration={keyboardDuration}
      />

      <PetBottomCard
        pet={selectedPet}
        bottom={tabBarOffset + 76 + 14}
        onDismiss={() => setSelectedPet(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    gap: 10,
    paddingBottom: 10,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
  },
  searchInput: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchText: {
    flex: 1,
    fontFamily: "Alexandria_400Regular",
    fontSize: 12,
    padding: 0,
    includeFontPadding: false,
    textAlignVertical: "center",
  },
  recenterBtn: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  loadingBadge: {
    position: "absolute",
    top: 120,
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 20,
    padding: 8,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  petsBadge: {
    position: "absolute",
    top: 120,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  petsBadgeText: {
    fontFamily: "Alexandria_400Regular",
    fontSize: 12,
  },
  pawFab: {
    position: "absolute",
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
});
