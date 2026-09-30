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
};
