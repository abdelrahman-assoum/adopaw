import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import { TABLES } from "@/src/shared/constants/tables";
import { supabase } from "@/src/shared/services/supabase/client";
import { fetchPetById } from "@/src/features/pets/services/petService";

const PAGE_SIZE = 10;

// Maps age category keys to PostgREST OR filter strings.
// age_unit values in DB: "days", "months", "years" (plural, from AgeInput).
const AGE_FILTERS = {
  baby:   "age_unit.eq.days,and(age_unit.eq.months,age_value.lte.11),and(age_unit.eq.years,age_value.lte.1)",
  young:  "and(age_unit.eq.months,age_value.gte.12,age_value.lte.36),and(age_unit.eq.years,age_value.gte.1,age_value.lte.3)",
  adult:  "and(age_unit.eq.months,age_value.gte.36,age_value.lte.84),and(age_unit.eq.years,age_value.gte.3,age_value.lte.7)",
  senior: "and(age_unit.eq.months,age_value.gte.84),and(age_unit.eq.years,age_value.gte.7)",
};

async function fetchPetsPage({ pageParam = 0, filters = {} }) {
  let query = supabase
    .from(TABLES.PETS)
    .select("id, name, species, gender, age_value, age_unit, size, activity_level, images, lat, lng, status, created_at, posted_by, profiles:posted_by(id, name, avatar_url)")
    .eq("status", "available")
    .order("created_at", { ascending: false })
    .range(pageParam, pageParam + PAGE_SIZE - 1);

  if (filters.species?.length)        query = query.in("species", filters.species);
  if (filters.gender?.length)        query = query.in("gender", filters.gender);
  if (filters.size?.length)          query = query.in("size", filters.size);
  if (filters.activity_level?.length) query = query.in("activity_level", filters.activity_level);
  if (filters.search)                query = query.ilike("name", `%${filters.search}%`);
  if (filters.age?.length) {
    const orParts = filters.age
      .filter((k) => AGE_FILTERS[k])
      .map((k) => AGE_FILTERS[k])
      .join(",");
    if (orParts) query = query.or(orParts);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export function usePets(filters = {}) {
  return useInfiniteQuery({
    queryKey: ["pets", filters],
    queryFn: ({ pageParam = 0 }) => fetchPetsPage({ pageParam, filters }),
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === PAGE_SIZE ? allPages.length * PAGE_SIZE : undefined,
    initialPageParam: 0,
  });
}

export function usePet(petId) {
  return useQuery({
    queryKey: ["pet", petId],
    queryFn: () => fetchPetById(petId),
    enabled: !!petId,
  });
}
