import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Marker } from "react-native-maps";
import { CATEGORY_CONFIG } from "../data/places";

export default function PlaceMarker({ place, onPress, selected = false }) {
  const config = CATEGORY_CONFIG[place.category];

  const [trackChanges, setTrackChanges] = useState(true);
  useEffect(() => {
    setTrackChanges(true);
    const t = setTimeout(() => setTrackChanges(false), 300);
    return () => clearTimeout(t);
  }, [selected]);

  if (!config) return null;

  return (
    <Marker
      coordinate={{ latitude: place.latitude, longitude: place.longitude }}
      onPress={() => onPress?.(place)}
      tracksViewChanges={trackChanges}
      zIndex={selected ? 1 : 0}
    >
      <View style={[
        styles.marker,
        { backgroundColor: config.color },
        selected && styles.selected,
      ]}>
        <Text style={[styles.emoji, selected && styles.emojiSelected]}>
          {config.emoji}
        </Text>
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  marker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
  },
  selected: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 3,
    borderColor: "#fff",
    elevation: 6,
    shadowOpacity: 0.4,
  },
  emoji: { fontSize: 18 },
  emojiSelected: { fontSize: 22 },
});
