import { TABLES } from "@/src/shared/constants/tables";
import { supabase } from "@/src/shared/services/supabase/client";

export async function sendAdoptionRequest(petId, note) {
  const { data, error } = await supabase.rpc("send_adoption_request", {
    p_pet_id: petId,
    p_requester_note: note ?? null,
  });
  if (error) throw error;
  if (!data?.success) throw new Error(data?.error ?? "Failed to send request");
  return data;
}

export async function cancelAdoptionRequest(requestId) {
  const { data, error } = await supabase.rpc("cancel_adoption_request", {
    p_request_id: requestId,
  });
  if (error) throw error;
  return data;
}

export async function fetchMyRequestForPet(petId, userId) {
  const { data, error } = await supabase
    .from(TABLES.ADOPTION_REQUESTS)
    .select("id, status, owner_note")
    .eq("pet_id", petId)
    .eq("requester_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function fetchSentRequests(userId) {
  const { data, error } = await supabase
    .from(TABLES.ADOPTION_REQUESTS)
    .select(`
      id, status, requester_note, owner_note, created_at,
      pet:pets!pet_id(
        id, name, species, breed, gender, age_value, age_unit, images,
        owner:profiles!posted_by(id, name, avatar_url)
      )
    `)
    .eq("requester_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchReceivedRequests(userId) {
  const { data: myPets, error: petsError } = await supabase
    .from(TABLES.PETS)
    .select("id")
    .eq("posted_by", userId);
  if (petsError) throw petsError;
  if (!myPets?.length) return [];

  const petIds = myPets.map((p) => p.id);

  const { data, error } = await supabase
    .from(TABLES.ADOPTION_REQUESTS)
    .select(`
      id, status, requester_note, created_at,
      pet:pets!pet_id(id, name, species, breed, gender, age_value, age_unit, images),
      requester:profiles!requester_id(id, name, avatar_url)
    `)
    .in("pet_id", petIds)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchPendingReceivedCount(userId) {
  const { data: myPets } = await supabase
    .from(TABLES.PETS)
    .select("id")
    .eq("posted_by", userId);
  if (!myPets?.length) return 0;

  const { count, error } = await supabase
    .from(TABLES.ADOPTION_REQUESTS)
    .select("id", { count: "exact", head: true })
    .in("pet_id", myPets.map((p) => p.id))
    .eq("status", "pending");
  if (error) throw error;
  return count ?? 0;
}

export async function acceptAdoptionRequest(requestId, petId) {
  const { error } = await supabase
    .from(TABLES.ADOPTION_REQUESTS)
    .update({ status: "accepted" })
    .eq("id", requestId);
  if (error) throw error;

  if (petId) {
    const { error: petError } = await supabase
      .from(TABLES.PETS)
      .update({ status: "adopted" })
      .eq("id", petId);
    if (petError) throw petError;
  }
}

export async function deleteRequestsForPet(petId) {
  const { error } = await supabase
    .from(TABLES.ADOPTION_REQUESTS)
    .delete()
    .eq("pet_id", petId);
  if (error) throw error;
}

export async function declineAdoptionRequest(requestId, ownerNote) {
  const { data, error } = await supabase
    .from(TABLES.ADOPTION_REQUESTS)
    .update({ status: "declined", owner_note: ownerNote ?? null })
    .eq("id", requestId)
    .select()
    .single();
  if (error) throw error;
  return data;
}
