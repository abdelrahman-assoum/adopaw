import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  acceptAdoptionRequest,
  cancelAdoptionRequest,
  declineAdoptionRequest,
  fetchMyRequestForPet,
  fetchPendingReceivedCount,
  fetchReceivedRequests,
  fetchSentRequests,
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
      queryClient.invalidateQueries({ queryKey: ["sentRequests", userId] });
    },
  });
}

export function useSentRequests(userId) {
  return useQuery({
    queryKey: ["sentRequests", userId],
    queryFn: () => fetchSentRequests(userId),
    enabled: !!userId,
  });
}

export function useReceivedRequests(userId) {
  return useQuery({
    queryKey: ["receivedRequests", userId],
    queryFn: () => fetchReceivedRequests(userId),
    enabled: !!userId,
  });
}

export function usePendingReceivedCount(userId) {
  return useQuery({
    queryKey: ["pendingReceivedCount", userId],
    queryFn: () => fetchPendingReceivedCount(userId),
    enabled: !!userId,
  });
}

export function useAcceptRequest(userId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ requestId, petId }) => acceptAdoptionRequest(requestId, petId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["receivedRequests", userId] });
      queryClient.invalidateQueries({ queryKey: ["pendingReceivedCount", userId] });
      queryClient.invalidateQueries({ queryKey: ["pets"] });
      queryClient.invalidateQueries({ queryKey: ["userPets"] });
    },
  });
}

export function useDeclineRequest(userId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ requestId, ownerNote }) => declineAdoptionRequest(requestId, ownerNote),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["receivedRequests", userId] });
      queryClient.invalidateQueries({ queryKey: ["pendingReceivedCount", userId] });
    },
  });
}
