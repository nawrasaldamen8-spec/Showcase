import { useQuery } from "@tanstack/react-query";
import { apiClient, queryKeys } from "@shared/api/index.ts";
import type { CountryDto, LanguageRefDto, SpecialtyCategoryDto } from "@shared/api/apiClient.lookups.ts";

export function useCountriesQuery() {
  return useQuery<CountryDto[]>({
    queryKey: queryKeys.lookups.countries(),
    queryFn: () => apiClient.getCountries(),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours (static reference)
    gcTime: 1000 * 60 * 60 * 24,
  });
}

export function useLookupLanguagesQuery() {
  return useQuery<LanguageRefDto[]>({
    queryKey: queryKeys.lookups.languages(),
    queryFn: () => apiClient.getLookupLanguages(),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours (static reference)
    gcTime: 1000 * 60 * 60 * 24,
  });
}

export function useSpecialtiesQuery() {
  return useQuery<SpecialtyCategoryDto[]>({
    queryKey: queryKeys.lookups.specialties(),
    queryFn: () => apiClient.getSpecialties(),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours (static reference)
    gcTime: 1000 * 60 * 60 * 24,
  });
}
