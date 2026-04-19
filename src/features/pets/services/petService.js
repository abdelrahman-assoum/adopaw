import { TABLES } from "@/src/shared/constants/tables";
import { supabase } from "@/src/shared/services/supabase/client";

export async function fetchPetById(petId) {
  const { data, error } = await supabase
    .from(TABLES.PETS)
    .select("*, profiles:posted_by(id, name, avatar_url)")
    .eq("id", petId)
    .single();

  if (error) throw error;
  return data;
}

export async function createPet(petData) {
  const { data, error } = await supabase
    .from(TABLES.PETS)
    .insert(petData)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updatePet(petId, updates) {
  const { data, error } = await supabase
    .from(TABLES.PETS)
    .update(updates)
    .eq("id", petId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deletePet(petId) {
  const { error } = await supabase
    .from(TABLES.PETS)
    .delete()
    .eq("id", petId);

  if (error) throw error;
}

export async function setAdopted(petId) {
  return updatePet(petId, { status: "adopted" });
}
