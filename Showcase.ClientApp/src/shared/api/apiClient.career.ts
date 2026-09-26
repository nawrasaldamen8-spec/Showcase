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
import { httpFetch, USE_MOCK_API } from "./apiClient.base.ts";
import { careerMockService } from "./careerMockService.ts";

export const apiCareerClient = {
  async getCareerSummary(): Promise<CareerSummary> {
    if (USE_MOCK_API) {
      return careerMockService.getCareerSummary();
    }
    return httpFetch<CareerSummary>("/api/career/summary");
  },

  async getExperiences(): Promise<CareerExperience[]> {
    if (USE_MOCK_API) {
      return careerMockService.getExperiences();
    }
    return httpFetch<CareerExperience[]>("/api/career/experiences");
  },

  async createExperience(data: Omit<CareerExperience, "id" | "createdAt">): Promise<CareerExperience> {
    if (USE_MOCK_API) {
      return careerMockService.createExperience(data);
    }
    return httpFetch<CareerExperience>("/api/career/experiences", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateExperience(id: string, data: Partial<CareerExperience>): Promise<CareerExperience> {
    if (USE_MOCK_API) {
      return careerMockService.updateExperience(id, data);
    }
    return httpFetch<CareerExperience>(`/api/career/experiences/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async deleteExperience(id: string): Promise<void> {
    if (USE_MOCK_API) {
      return careerMockService.deleteExperience(id);
    }
    return httpFetch<void>(`/api/career/experiences/${id}`, { method: "DELETE" });
  },

  async getAcademics(): Promise<CareerAcademic[]> {
    if (USE_MOCK_API) {
      return careerMockService.getAcademics();
    }
    return httpFetch<CareerAcademic[]>("/api/career/academics");
  },

  async createAcademic(data: Omit<CareerAcademic, "id" | "createdAt">): Promise<CareerAcademic> {
    if (USE_MOCK_API) {
      return careerMockService.createAcademic(data);
    }
    return httpFetch<CareerAcademic>("/api/career/academics", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateAcademic(id: string, data: Partial<CareerAcademic>): Promise<CareerAcademic> {
    if (USE_MOCK_API) {
      return careerMockService.updateAcademic(id, data);
    }
    return httpFetch<CareerAcademic>(`/api/career/academics/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async deleteAcademic(id: string): Promise<void> {
    if (USE_MOCK_API) {
      return careerMockService.deleteAcademic(id);
    }
    return httpFetch<void>(`/api/career/academics/${id}`, { method: "DELETE" });
  },

  async getSkills(): Promise<CareerSkill[]> {
    if (USE_MOCK_API) {
      return careerMockService.getSkills();
    }
    return httpFetch<CareerSkill[]>("/api/career/skills");
  },

  async createSkill(data: Omit<CareerSkill, "id" | "createdAt">): Promise<CareerSkill> {
    if (USE_MOCK_API) {
      return careerMockService.createSkill(data);
    }
    return httpFetch<CareerSkill>("/api/career/skills", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateSkill(id: string, data: Partial<CareerSkill>): Promise<CareerSkill> {
    if (USE_MOCK_API) {
      return careerMockService.updateSkill(id, data);
    }
    return httpFetch<CareerSkill>(`/api/career/skills/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async deleteSkill(id: string): Promise<void> {
    if (USE_MOCK_API) {
      return careerMockService.deleteSkill(id);
    }
    return httpFetch<void>(`/api/career/skills/${id}`, { method: "DELETE" });
  },

  async getCredentials(): Promise<CareerCredential[]> {
    if (USE_MOCK_API) {
      return careerMockService.getCredentials();
    }
    return httpFetch<CareerCredential[]>("/api/career/credentials");
  },

  async createCredential(data: Omit<CareerCredential, "id" | "createdAt">): Promise<CareerCredential> {
    if (USE_MOCK_API) {
      return careerMockService.createCredential(data);
    }
    return httpFetch<CareerCredential>("/api/career/credentials", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateCredential(id: string, data: Partial<CareerCredential>): Promise<CareerCredential> {
    if (USE_MOCK_API) {
      return careerMockService.updateCredential(id, data);
    }
    return httpFetch<CareerCredential>(`/api/career/credentials/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async deleteCredential(id: string): Promise<void> {
    if (USE_MOCK_API) {
      return careerMockService.deleteCredential(id);
    }
    return httpFetch<void>(`/api/career/credentials/${id}`, { method: "DELETE" });
  },

  async getLanguages(): Promise<CareerLanguage[]> {
    if (USE_MOCK_API) {
      return careerMockService.getLanguages();
    }
    return httpFetch<CareerLanguage[]>("/api/career/languages");
  },

  async createLanguage(data: Omit<CareerLanguage, "id" | "createdAt">): Promise<CareerLanguage> {
    if (USE_MOCK_API) {
      return careerMockService.createLanguage(data);
    }
    return httpFetch<CareerLanguage>("/api/career/languages", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateLanguage(id: string, data: Partial<CareerLanguage>): Promise<CareerLanguage> {
    if (USE_MOCK_API) {
      return careerMockService.updateLanguage(id, data);
    }
    return httpFetch<CareerLanguage>(`/api/career/languages/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async deleteLanguage(id: string): Promise<void> {
    if (USE_MOCK_API) {
      return careerMockService.deleteLanguage(id);
    }
    return httpFetch<void>(`/api/career/languages/${id}`, { method: "DELETE" });
  },

  async getAchievements(): Promise<CareerAchievement[]> {
    if (USE_MOCK_API) {
      return careerMockService.getAchievements();
    }
    return httpFetch<CareerAchievement[]>("/api/career/achievements");
  },

  async createAchievement(data: Omit<CareerAchievement, "id" | "createdAt">): Promise<CareerAchievement> {
    if (USE_MOCK_API) {
      return careerMockService.createAchievement(data);
    }
    return httpFetch<CareerAchievement>("/api/career/achievements", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateAchievement(id: string, data: Partial<CareerAchievement>): Promise<CareerAchievement> {
    if (USE_MOCK_API) {
      return careerMockService.updateAchievement(id, data);
    }
    return httpFetch<CareerAchievement>(`/api/career/achievements/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async deleteAchievement(id: string): Promise<void> {
    if (USE_MOCK_API) {
      return careerMockService.deleteAchievement(id);
    }
    return httpFetch<void>(`/api/career/achievements/${id}`, { method: "DELETE" });
  },

  async getCareerVisibility(): Promise<CareerVisibilitySettings> {
    if (USE_MOCK_API) {
      return careerMockService.getCareerVisibility();
    }
    return httpFetch<CareerVisibilitySettings>("/api/career/visibility");
  },

  async updateCareerVisibility(settings: Partial<CareerVisibilitySettings>): Promise<CareerVisibilitySettings> {
    if (USE_MOCK_API) {
      return careerMockService.updateCareerVisibility(settings);
    }
    return httpFetch<CareerVisibilitySettings>("/api/career/visibility", {
      method: "PUT",
      body: JSON.stringify(settings),
    });
  },

  async toggleSectionVisibility(
    section: keyof CareerVisibilitySettings,
    isVisible: boolean
  ): Promise<CareerVisibilitySettings> {
    if (USE_MOCK_API) {
      return careerMockService.toggleSectionVisibility(section, isVisible);
    }
    return httpFetch<CareerVisibilitySettings>(`/api/career/visibility/${section}`, {
      method: "PUT",
      body: JSON.stringify({ isVisible }),
    });
  },

  async getPublicCareer(username?: string): Promise<PublicCareerData> {
    if (USE_MOCK_API) {
      return careerMockService.getPublicCareer(username);
    }
    const path = username ? `/api/career/public/${encodeURIComponent(username)}` : "/api/career/public";
    return httpFetch<PublicCareerData>(path, { requiresAuth: false });
  },
};
