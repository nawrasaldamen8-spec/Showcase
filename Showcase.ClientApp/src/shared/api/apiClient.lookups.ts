import { httpFetch } from "./apiClient.base.ts";

export interface CountryDto {
  id: number;
  alpha2: string;
  alpha3: string;
  name: string;
}

export interface LanguageRefDto {
  code: string;
  name: string;
}

export interface TagDto {
  name: string;
  usageCount: number;
}

export interface SpecialtyItemDto {
  id: number;
  code: string;
  name: string;
  subField: string;
}

export interface SpecialtyCategoryDto {
  name: string;
  specialties: SpecialtyItemDto[];
}

export const apiLookupsClient = {
  async getCountries(): Promise<CountryDto[]> {
    return httpFetch<CountryDto[]>("/api/lookups/countries", { requiresAuth: false });
  },

  async getLookupLanguages(): Promise<LanguageRefDto[]> {
    return httpFetch<LanguageRefDto[]>("/api/lookups/languages", { requiresAuth: false });
  },

  async getPopularTags(limit = 20): Promise<TagDto[]> {
    return httpFetch<TagDto[]>(`/api/lookups/tags?limit=${limit}`, { requiresAuth: false });
  },

  async getSpecialties(): Promise<SpecialtyCategoryDto[]> {
    return httpFetch<SpecialtyCategoryDto[]>("/api/lookups/specialties", { requiresAuth: false });
  },
};
