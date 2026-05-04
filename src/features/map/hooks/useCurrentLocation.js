import * as Location from "expo-location";
import { useCallback, useEffect, useState } from "react";

const FALLBACK = { latitude: 33.8938, longitude: 35.5018, latitudeDelta: 0.04, longitudeDelta: 0.04 };

export function useCurrentLocation() {
  const [region, setRegion] = useState(FALLBACK);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getLocation = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") throw new Error("Location permission denied");
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const c = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
      setUserLocation(c);
      setRegion({ ...c, latitudeDelta: 0.04, longitudeDelta: 0.04 });
    } catch (e) {
      setError(e.message);
      setRegion(FALLBACK);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { getLocation(); }, [getLocation]);

  const recenter = useCallback(async () => {
    try {
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const c = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
      setUserLocation(c);
      setRegion(r => ({ ...r, ...c }));
    } catch { /* keep current region */ }
  }, []);

  return { region, setRegion, userLocation, loading, error, recenter };
}
