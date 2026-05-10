import { useQuery } from "@tanstack/react-query";
import { fetchPetsInBounds } from "../services/petMapService";

// Round to 2 decimal places (~1.1 km) so minor panning doesn't trigger a refetch
function roundBounds(bounds) {
  if (!bounds) return null;
  return {
    northLat: Math.round(bounds.northLat * 100) / 100,
    southLat: Math.round(bounds.southLat * 100) / 100,
    eastLng:  Math.round(bounds.eastLng  * 100) / 100,
    westLng:  Math.round(bounds.westLng  * 100) / 100,
  };
}

export function usePetsInBounds(bounds, enabled = true) {
  const rounded = roundBounds(bounds);

  return useQuery({
    queryKey: ["petsInBounds", rounded],
    queryFn: () => fetchPetsInBounds(rounded),
    enabled: enabled && !!rounded,
    staleTime: 60_000,
    placeholderData: (prev) => prev, // keep last region's data while new one loads
  });
}

export function getBoundsFromRegion(region) {
  if (!region) return null;
  return {
    northLat: region.latitude + region.latitudeDelta / 2,
    southLat: region.latitude - region.latitudeDelta / 2,
    eastLng:  region.longitude + region.longitudeDelta / 2,
    westLng:  region.longitude - region.longitudeDelta / 2,
  };
}
