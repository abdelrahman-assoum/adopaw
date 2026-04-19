import { useCallback, useState } from "react";

const DEFAULT_FILTERS = {
  species: null,
  gender: null,
  size: null,
  activity: null,
  search: "",
};

export function useFilters() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const setFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const activeCount = Object.entries(filters).filter(
    ([key, val]) => key !== "search" && val !== null
  ).length;

  return { filters, setFilter, resetFilters, activeCount };
}
