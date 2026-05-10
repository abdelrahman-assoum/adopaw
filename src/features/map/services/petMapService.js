import { TABLES } from "@/src/shared/constants/tables";
import { supabase } from "@/src/shared/services/supabase/client";

const MAP_PAGE_SIZE = 20;

export async function fetchPetsInBounds({ northLat, southLat, eastLng, westLng }) {
  const { data, error } = await supabase
    .from(TABLES.PETS)
    .select("id, name, species, gender, images, lat, lng")
    .eq("status", "available")
    .not("lat", "is", null)
    .not("lng", "is", null)
    .gte("lat", southLat)
    .lte("lat", northLat)
    .gte("lng", westLng)
    .lte("lng", eastLng)
    .order("created_at", { ascending: false })
    .limit(MAP_PAGE_SIZE);

  if (error) throw error;
  return data ?? [];
}
