import type {
  CareerAcademic,
  CareerAchievement,
  CareerCredential,
  CareerExperience,
  CareerLanguage,
  CareerSkill,
  CareerSummary,
  CareerVisibilitySettings,
  PublicCareerData,
} from "../types/index.ts";
import { httpFetch } from "./apiClient.base.ts";

export const apiCareerClient = {
  async getCareerSummary(): Promise<CareerSummary> {
    return httpFetch<CareerSummary>("/api/career/summary");
  },

  async getExperiences(): Promise<CareerExperience[]> {
    return httpFetch<CareerExperience[]>("/api/career/experiences");
  },

  async createExperience(data: Partial<CareerExperience>): Promise<CareerExperience> {
    return httpFetch<CareerExperience>("/api/career/experiences", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateExperience(id: string, data: Partial<CareerExperience>): Promise<CareerExperience> {
    return httpFetch<CareerExperience>(`/api/career/experiences/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async deleteExperience(id: string): Promise<void> {
    return httpFetch<void>(`/api/career/experiences/${id}`, { method: "DELETE" });
  },

  async getAcademics(): Promise<CareerAcademic[]> {
    return httpFetch<CareerAcademic[]>("/api/career/academics");
  },

  async createAcademic(data: Partial<CareerAcademic>): Promise<CareerAcademic> {
    return httpFetch<CareerAcademic>("/api/career/academics", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateAcademic(id: string, data: Partial<CareerAcademic>): Promise<CareerAcademic> {
    return httpFetch<CareerAcademic>(`/api/career/academics/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async deleteAcademic(id: string): Promise<void> {
    return httpFetch<void>(`/api/career/academics/${id}`, { method: "DELETE" });
  },

  async getSkills(): Promise<CareerSkill[]> {
    return httpFetch<CareerSkill[]>("/api/career/skills");
  },

  async createSkill(data: Partial<CareerSkill>): Promise<CareerSkill> {
    return httpFetch<CareerSkill>("/api/career/skills", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateSkill(id: string, data: Partial<CareerSkill>): Promise<CareerSkill> {
    return httpFetch<CareerSkill>(`/api/career/skills/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async deleteSkill(id: string): Promise<void> {
    return httpFetch<void>(`/api/career/skills/${id}`, { method: "DELETE" });
  },

  async getCredentials(): Promise<CareerCredential[]> {
    return httpFetch<CareerCredential[]>("/api/career/credentials");
  },

  async createCredential(data: Partial<CareerCredential>): Promise<CareerCredential> {
    return httpFetch<CareerCredential>("/api/career/credentials", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateCredential(id: string, data: Partial<CareerCredential>): Promise<CareerCredential> {
    return httpFetch<CareerCredential>(`/api/career/credentials/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async deleteCredential(id: string): Promise<void> {
    return httpFetch<void>(`/api/career/credentials/${id}`, { method: "DELETE" });
  },

  async getLanguages(): Promise<CareerLanguage[]> {
    return httpFetch<CareerLanguage[]>("/api/career/languages");
  },

  async createLanguage(data: Partial<CareerLanguage>): Promise<CareerLanguage> {
    return httpFetch<CareerLanguage>("/api/career/languages", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateLanguage(id: string, data: Partial<CareerLanguage>): Promise<CareerLanguage> {
    return httpFetch<CareerLanguage>(`/api/career/languages/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async deleteLanguage(id: string): Promise<void> {
    return httpFetch<void>(`/api/career/languages/${id}`, { method: "DELETE" });
  },

  async getAchievements(): Promise<CareerAchievement[]> {
    return httpFetch<CareerAchievement[]>("/api/career/achievements");
  },

  async createAchievement(data: Partial<CareerAchievement>): Promise<CareerAchievement> {
    return httpFetch<CareerAchievement>("/api/career/achievements", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateAchievement(id: string, data: Partial<CareerAchievement>): Promise<CareerAchievement> {
    return httpFetch<CareerAchievement>(`/api/career/achievements/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async deleteAchievement(id: string): Promise<void> {
    return httpFetch<void>(`/api/career/achievements/${id}`, { method: "DELETE" });
  },

  async getCareerVisibility(): Promise<CareerVisibilitySettings> {
    return httpFetch<CareerVisibilitySettings>("/api/career/visibility");
  },

  async updateCareerVisibility(settings: Partial<CareerVisibilitySettings>): Promise<CareerVisibilitySettings> {
    return httpFetch<CareerVisibilitySettings>("/api/career/visibility", {
      method: "PUT",
      body: JSON.stringify(settings),
    });
  },

  async toggleSectionVisibility(
    section: keyof CareerVisibilitySettings,
    isVisible: boolean
  ): Promise<CareerVisibilitySettings> {
    return httpFetch<CareerVisibilitySettings>(`/api/career/visibility/${section}`, {
      method: "PUT",
      body: JSON.stringify({ isVisible }),
    });
  },

  async getPublicCareer(username?: string): Promise<PublicCareerData> {
    const path = username ? `/api/career/public/${encodeURIComponent(username)}` : "/api/career/public";
    return httpFetch<PublicCareerData>(path, { requiresAuth: false });
  },
};
