import { useQuery } from "@tanstack/react-query";
import { CATEGORIES } from "../data/places";

const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
const BASE = "https://maps.googleapis.com/maps/api/place/nearbysearch/json";
const RADIUS = 5000;

const CATEGORY_PARAMS = {
  veterinary: { type: "veterinary_care" },
  petStore:   { type: "pet_store" },
  shelter:    { keyword: "animal shelter" },
  park:       { type: "park" },
};

async function fetchCategory(lat, lng, category) {
  const params = new URLSearchParams({
    location: `${lat},${lng}`,
    radius: String(RADIUS),
    key: API_KEY,
    ...CATEGORY_PARAMS[category],
  });

  const res = await fetch(`${BASE}?${params}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();

  if (json.status !== "OK" && json.status !== "ZERO_RESULTS") {
    console.warn(`[Places API] ${category}: ${json.status} – ${json.error_message ?? ""}`);
    return [];
  }

  return (json.results ?? []).map((p) => ({
    id: p.place_id,
    name: p.name,
    description: p.vicinity ?? "",
    latitude: p.geometry.location.lat,
    longitude: p.geometry.location.lng,
    category,
    rating: p.rating ?? 0,
    reviewCount: p.user_ratings_total ?? 0,
    isOpen: p.opening_hours?.open_now ?? null,
  }));
}

async function fetchAllNearby(lat, lng) {
  const settled = await Promise.allSettled(
    CATEGORIES.map((cat) => fetchCategory(lat, lng, cat))
  );
  return settled.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
}

export function usePlaces(region) {
  // Round to 2 decimal places (~1.1 km) so minor panning doesn't retrigger
  const lat = region?.latitude  != null ? Math.round(region.latitude  * 100) / 100 : null;
  const lng = region?.longitude != null ? Math.round(region.longitude * 100) / 100 : null;

  return useQuery({
    queryKey: ["nearby-places", lat, lng],
    queryFn: () => fetchAllNearby(region.latitude, region.longitude),
    enabled: lat != null && lng != null,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    placeholderData: (prev) => prev ?? [],
  });
}
