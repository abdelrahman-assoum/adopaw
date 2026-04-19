import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, Modal, Pressable, StyleSheet, View } from "react-native";
import MapView, { Marker } from "react-native-maps";

export default function MapPickerModal({ visible, onClose, onSubmit }) {
  const [initialRegion, setInitialRegion] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!visible) return;
    (async () => {
      setLoading(true);
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") { alert("Permission denied"); onClose(); return; }
        const loc = await Location.getCurrentPositionAsync({});
        const region = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
        setInitialRegion(region);
        setSelectedLocation({ latitude: region.latitude, longitude: region.longitude });
      } catch {
        alert("Error getting location");
        onClose();
      } finally {
        setLoading(false);
      }
    })();
  }, [visible]);

  const handleSubmit = async () => {
    if (!selectedLocation) return;
    try {
      const geocode = await Location.reverseGeocodeAsync(selectedLocation);
      const a = geocode?.[0];
      const readable = a
        ? `${a.city || a.region || ""}, ${a.country || ""}`.replace(/^,\s*|,\s*$/, "")
        : "Unknown location";
      onSubmit({
        geoJson: { type: "Point", coordinates: [selectedLocation.longitude, selectedLocation.latitude] },
        readable,
      });
    } catch {
      alert("Error getting address");
    }
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        {loading || !initialRegion ? (
          <ActivityIndicator size="large" style={{ marginTop: 50 }} />
        ) : (
          <>
            <MapView
              style={styles.map}
              initialRegion={initialRegion}
              onPress={(e) => setSelectedLocation(e.nativeEvent.coordinate)}
            >
              {selectedLocation && <Marker coordinate={selectedLocation} />}
            </MapView>
            <View style={styles.controls}>
              <Pressable style={styles.iconButton} onPress={onClose}>
                <Ionicons name="close" size={24} color="#fff" />
              </Pressable>
              <Pressable style={styles.submitButton} onPress={handleSubmit}>
                <Ionicons name="checkmark" size={24} color="#fff" />
              </Pressable>
            </View>
          </>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  controls: {
    position: "absolute",
    top: 40,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  iconButton: { backgroundColor: "rgba(0,0,0,0.6)", padding: 10, borderRadius: 30 },
  submitButton: { backgroundColor: "#007BFF", padding: 10, borderRadius: 30 },
});
