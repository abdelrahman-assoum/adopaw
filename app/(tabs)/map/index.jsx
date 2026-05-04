import { Ionicons } from "@expo/vector-icons";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import { useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import CategoryChips from "@/src/features/map/components/CategoryChips";
import PlaceMarker from "@/src/features/map/components/PlaceMarker";
import PlacesBottomSheet from "@/src/features/map/components/PlacesBottomSheet";
import { usePlaces } from "@/src/features/map/hooks/usePlaces";
import { useCurrentLocation } from "@/src/features/map/hooks/useCurrentLocation";
import { useTranslationLoader } from "@/src/localization/hooks/useTranslationLoader";

const SCREEN_H = Dimensions.get("window").height;

export default function MapPage() {
  const { t } = useTranslationLoader("map");
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { region, setRegion, userLocation, loading: locationLoading, recenter } = useCurrentLocation();

  const [mapReady, setMapReady] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [overlayHeight, setOverlayHeight] = useState(0);

  const onMapReady = useCallback(() => setMapReady(true), []);
  const onOverlayLayout = useCallback((e) => {
    setOverlayHeight(e.nativeEvent.layout.height);
  }, []);

  const tabBarOffset = 64 + Math.max(insets.bottom - 12, 0);
  const maxSheetHeight = overlayHeight > 0
    ? SCREEN_H - overlayHeight - tabBarOffset - 32
    : 360;

  const { data: places = [], isFetching: loadingPlaces } = usePlaces(region);

  const filteredPlaces = useMemo(() => {
    let result = places;
    if (selectedCategory) {
      result = result.filter((p) => p.category === selectedCategory);
    }
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
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

  const skipNextMapPress = useRef(false);

  const handleMarkerPress = useCallback((place) => {
    setSelectedPlace((prev) => {
      if (prev?.id === place.id) return null; // tap selected pin = deselect
      skipNextMapPress.current = true;
      // Safety reset: on Android MapView.onPress never fires after a marker tap
      setTimeout(() => { skipNextMapPress.current = false; }, 300);
      return place;
    });
  }, []);

  const handleMapPress = useCallback(() => {
    if (skipNextMapPress.current) {
      skipNextMapPress.current = false;
      return;
    }
    setSelectedPlace(null);
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedPlace(null);
  }, []);

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
            selected={!!selectedPlace}
          />
        ))}
      </MapView>

      {/* Top overlay — measured for maxSheetHeight */}
      <View
        style={[styles.topOverlay, { paddingTop: insets.top + 8 }]}
        onLayout={onOverlayLayout}
      >
        <View style={styles.searchRow}>
          <View style={[styles.searchInput, { backgroundColor: inputBg, borderColor: inputBorder }]}>
            <Ionicons name="search-outline" size={16} color={iconColor} />
            <TextInput
              style={[styles.searchText, { color: textColor }]}
              placeholder={t("search.placeholder", "Search for location")}
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

      <PlacesBottomSheet
        places={filteredPlaces}
        loading={loadingPlaces}
        selectedPlace={selectedPlace}
        onClearSelection={handleClearSelection}
        onSelectPlace={handleMarkerPress}
        maxHeight={maxSheetHeight}
        tabBarOffset={tabBarOffset}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
});
