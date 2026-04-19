import { TABLES } from "@/src/shared/constants/tables";
import { supabase } from "@/src/shared/services/supabase/client";

export async function fetchProfile(userId) {
  const { data, error } = await supabase
    .from(TABLES.PROFILES)
    .select("*")
    .eq("id", userId)
    .single();

  if (error) throw error;
  return data;
}

export async function updateProfile(userId, updates) {
  const { data, error } = await supabase
    .from(TABLES.PROFILES)
    .update(updates)
    .eq("id", userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function fetchUserPets(userId) {
  const { data, error } = await supabase
    .from(TABLES.PETS)
    .select("*")
    .eq("posted_by", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}
