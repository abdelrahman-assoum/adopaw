import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import { Marker } from "react-native-maps";
import { useTheme } from "react-native-paper";

const SIZE_DEFAULT  = 42;
const SIZE_SELECTED = 54;

export default function PetMarker({ pet, onPress, selected = false }) {
  const theme = useTheme();

  // tracksViewChanges must briefly be true when appearance changes so the
  // native layer re-renders the bitmap (Android requirement), then go false
  // to stop the per-frame bitmapping that tanks scroll performance.
  const [trackChanges, setTrackChanges] = useState(true);
  useEffect(() => {
    setTrackChanges(true);
    const t = setTimeout(() => setTrackChanges(false), 350);
    return () => clearTimeout(t);
  }, [selected]);

  const size    = selected ? SIZE_SELECTED : SIZE_DEFAULT;
  const radius  = size / 2;
  const border  = selected ? 3 : 2;
  const bColor  = selected ? theme.colors.primary : "#fff";

  return (
    <Marker
      coordinate={{ latitude: pet.lat, longitude: pet.lng }}
      onPress={() => onPress?.(pet)}
      tracksViewChanges={trackChanges}
      zIndex={selected ? 2 : 1}
      anchor={{ x: 0.5, y: 0.5 }}
    >
      <View
        style={[
          styles.marker,
          {
            width: size,
            height: size,
            borderRadius: radius,
            borderWidth: border,
            borderColor: bColor,
          },
        ]}
      >
        <Image
          source={{ uri: pet.images?.[0] }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />

        {/* Paw badge pinned to bottom-right */}
        <View style={[styles.pawBadge, { backgroundColor: theme.colors.primary }]}>
          <Ionicons name="paw" size={9} color="#fff" />
        </View>
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  marker: {
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  pawBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#fff",
  },
});
