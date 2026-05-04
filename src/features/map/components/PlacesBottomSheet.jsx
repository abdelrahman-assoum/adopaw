import { useCallback, useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { useTranslationLoader } from "@/src/localization/hooks/useTranslationLoader";
import PlaceCard from "./PlaceCard";

const SNAP_PEEK    = 76;
const SNAP_DEFAULT = 360;
const SNAP_SINGLE  = 290;

export default function PlacesBottomSheet({
  places,
  tabBarOffset = 0,
  loading = false,
  selectedPlace = null,
  onClearSelection,
  onSelectPlace,
  maxHeight = 360,
}) {
  const { t } = useTranslationLoader("map");
  const theme = useTheme();

  const sheetBg  = theme.colors.surface;
  const handle   = theme.dark ? "#3A4048" : "#D9D9D9";
  const titleCol = theme.colors.onSurface;
  const countCol = theme.dark ? "#9CA3AF" : "#777";
  const border   = theme.dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";

  const heightAnim   = useRef(new Animated.Value(SNAP_DEFAULT)).current;
  const startHeight  = useRef(SNAP_DEFAULT);
  const maxHeightRef = useRef(maxHeight);

  useEffect(() => { maxHeightRef.current = maxHeight; }, [maxHeight]);

  const snapTo = useCallback((h) => {
    startHeight.current = h;
    Animated.spring(heightAnim, {
      toValue: h,
      useNativeDriver: false,
      bounciness: 4,
    }).start();
  }, [heightAnim]);

  // Snap when a pin is selected/deselected
  useEffect(() => {
    if (selectedPlace) {
      snapTo(SNAP_SINGLE);
    } else {
      snapTo(SNAP_DEFAULT);
    }
  }, [selectedPlace, snapTo]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 5,
      onPanResponderGrant: () => {
        heightAnim.stopAnimation((v) => { startHeight.current = v; });
      },
      onPanResponderMove: (_, g) => {
        const newH = Math.max(SNAP_PEEK, Math.min(maxHeightRef.current, startHeight.current - g.dy));
        heightAnim.setValue(newH);
      },
      onPanResponderRelease: (_, g) => {
        heightAnim.stopAnimation((h) => {
          const max = maxHeightRef.current;
          if (g.vy > 0.5 || h < (SNAP_PEEK + SNAP_DEFAULT) / 2) {
            snapTo(SNAP_PEEK);
          } else if (g.vy < -0.5 || h > (SNAP_DEFAULT + max) / 2) {
            snapTo(max);
          } else {
            snapTo(SNAP_DEFAULT);
          }
        });
      },
    })
  ).current;

  const displayPlaces = selectedPlace ? [selectedPlace] : places;
  const isFiltered = !!selectedPlace;
  const countText = isFiltered
    ? t(`categories.${selectedPlace.category}`, "Place")
    : t("placesFound", { count: places.length, defaultValue: `${places.length} places found` });

  return (
    <Animated.View style={[
      styles.sheet,
      { height: heightAnim, bottom: tabBarOffset, backgroundColor: sheetBg },
    ]}>
      {/* Drag handle */}
      <View {...panResponder.panHandlers} style={styles.handleArea}>
        <View style={[styles.handle, { backgroundColor: handle }]} />

        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            <Text style={[styles.sheetTitle, { color: titleCol }]}>
              {isFiltered ? selectedPlace.name : t("nearestPlaces", "Nearest Places")}
            </Text>
            <Text style={[styles.sheetCount, { color: countCol }]}>{countText}</Text>
          </View>

          {isFiltered && (
            <TouchableOpacity
              style={[styles.clearBtn, { backgroundColor: theme.dark ? "rgba(255,255,255,0.08)" : "#F3F4F6" }]}
              onPress={onClearSelection}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close" size={16} color={titleCol} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: border }]} />

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={displayPlaces}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PlaceCard
              place={item}
              onPress={selectedPlace?.id === item.id ? undefined : () => onSelectPlace?.(item)}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          scrollEnabled
          nestedScrollEnabled
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: countCol }]}>
              No places found nearby
            </Text>
          }
        />
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 14,
    overflow: "hidden",
  },
  handleArea: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  handle: {
    width: 100,
    height: 4,
    borderRadius: 8,
    alignSelf: "center",
    marginBottom: 10,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  sheetTitle: {
    fontFamily: "Alexandria_500Medium",
    fontSize: 18,
    lineHeight: 26,
  },
  sheetCount: {
    fontFamily: "Alexandria_400Regular",
    fontSize: 12,
    lineHeight: 18,
  },
  clearBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginHorizontal: 20,
    marginBottom: 4,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    gap: 10,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
  },
  emptyText: {
    fontFamily: "Alexandria_400Regular",
    fontSize: 13,
    textAlign: "center",
    marginTop: 24,
  },
});
