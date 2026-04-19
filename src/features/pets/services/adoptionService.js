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
