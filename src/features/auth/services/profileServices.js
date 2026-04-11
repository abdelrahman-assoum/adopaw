import { TABLES } from "../../../shared/constants/tables";
import { supabase } from "../../../shared/services/supabase/client";

export async function createProfile({ id, name, avatarUrl, location }) {
  const { data: { session } } = await supabase.auth.getSession();
  console.log("[createProfile] auth.uid:", session?.user?.id);
  console.log("[createProfile] inserting id:", id);
  console.log("[createProfile] id match:", session?.user?.id === id);

  const lng = location?.coordinates?.[0] ?? null;
  const lat = location?.coordinates?.[1] ?? null;
  const wktLocation = lng != null && lat != null
    ? `SRID=4326;POINT(${lng} ${lat})`
    : null;

  const payload = {
    id,
    name,
    ...(avatarUrl && { avatar_url: avatarUrl }),
    ...(lat != null && { lat, lng }),
    ...(wktLocation && { location: wktLocation }),
  };
  console.log("[createProfile] payload:", JSON.stringify(payload));

  const { data, error } = await supabase
    .from(TABLES.PROFILES)
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error("[createProfile] error:", error.code, error.message, error.details);
    throw error;
  }
  console.log("[createProfile] success:", data?.id);
  return data;
}

export async function updatePetPreferences(userId, prefs) {
  const { data, error } = await supabase
    .from(TABLES.PROFILES)
    .update({ pet_preferences: prefs })
    .eq("id", userId)
    .select("pet_preferences")
    .single();

  if (error) throw error;
  return data.pet_preferences;
}
