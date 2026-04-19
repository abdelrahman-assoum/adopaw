import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  fetchProfile,
  fetchUserPets,
  updateProfile,
} from "../services/profileService";

export function useProfile(userId) {
  return useQuery({
    queryKey: ["profile", userId],
    queryFn: () => fetchProfile(userId),
    enabled: !!userId,
  });
}

export function useUserPets(userId) {
  return useQuery({
    queryKey: ["userPets", userId],
    queryFn: () => fetchUserPets(userId),
    enabled: !!userId,
  });
}

export function useUpdateProfile(userId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (updates) => updateProfile(userId, updates),
    onSuccess: (data) => {
      queryClient.setQueryData(["profile", userId], data);
    },
  });
}
