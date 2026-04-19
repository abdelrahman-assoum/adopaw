import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  cancelAdoptionRequest,
  fetchMyRequestForPet,
  sendAdoptionRequest,
} from "../services/adoptionService";

export function useMyAdoptionRequest(petId, userId) {
  return useQuery({
    queryKey: ["adoptionRequest", petId, userId],
    queryFn: () => fetchMyRequestForPet(petId, userId),
    enabled: !!petId && !!userId,
  });
}

export function useSendAdoptionRequest(petId, userId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (note) => sendAdoptionRequest(petId, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adoptionRequest", petId, userId] });
    },
  });
}

export function useCancelAdoptionRequest(petId, userId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (requestId) => cancelAdoptionRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adoptionRequest", petId, userId] });
    },
  });
}
