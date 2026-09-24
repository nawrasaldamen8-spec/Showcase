import type {
  CareerExperience,
  CareerAcademic,
  CareerSkill,
  CareerCredential,
  CareerLanguage,
  CareerAchievement,
  CareerSummary,
} from "../types/career.ts";
import {
  initialExperiences,
  initialAcademics,
  initialSkills,
  initialCredentials,
  initialLanguages,
  initialAchievements,
} from "./careerMockData.ts";

const STORAGE_KEYS = {
  experiences: "showcase_career_experiences",
  academics: "showcase_career_academics",
  skills: "showcase_career_skills",
  credentials: "showcase_career_credentials",
  languages: "showcase_career_languages",
  achievements: "showcase_career_achievements",
};

function getData<T>(key: string, initialData: T[]): T[] {
  if (typeof window === "undefined" || !window.localStorage) return initialData;
  const stored = localStorage.getItem(key);
  if (stored) {
    try {
      return JSON.parse(stored) as T[];
    } catch {
      // ignore
    }
  }
  try {
    localStorage.setItem(key, JSON.stringify(initialData));
  } catch {
    // ignore
  }
  return initialData;
}

function setData<T>(key: string, data: T[]): void {
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch {
      // ignore
    }
  }
}

export const careerMockService = {
  getCareerSummary: async (): Promise<CareerSummary> => {
    return {
      experienceCount: getData(STORAGE_KEYS.experiences, initialExperiences).length,
      academicsCount: getData(STORAGE_KEYS.academics, initialAcademics).length,
      skillsCount: getData(STORAGE_KEYS.skills, initialSkills).length,
      credentialsCount: getData(STORAGE_KEYS.credentials, initialCredentials).length,
      languagesCount: getData(STORAGE_KEYS.languages, initialLanguages).length,
      achievementsCount: getData(STORAGE_KEYS.achievements, initialAchievements).length,
    };
  },
  getExperiences: async (): Promise<CareerExperience[]> => getData(STORAGE_KEYS.experiences, initialExperiences),
  createExperience: async (data: Omit<CareerExperience, "id" | "createdAt">): Promise<CareerExperience> => {
    const list = getData(STORAGE_KEYS.experiences, initialExperiences);
    const newItem: CareerExperience = { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    setData(STORAGE_KEYS.experiences, [newItem, ...list]);
    return newItem;
  },
  updateExperience: async (id: string, data: Partial<CareerExperience>): Promise<CareerExperience> => {
    const list = getData(STORAGE_KEYS.experiences, initialExperiences);
    const index = list.findIndex(x => x.id === id);
    if (index === -1) throw new Error("Not found");
    const updated = { ...list[index], ...data };
    list[index] = updated;
    setData(STORAGE_KEYS.experiences, list);
    return updated;
  },
  deleteExperience: async (id: string): Promise<void> => {
    const list = getData(STORAGE_KEYS.experiences, initialExperiences);
    setData(STORAGE_KEYS.experiences, list.filter(x => x.id !== id));
  },

  getAcademics: async (): Promise<CareerAcademic[]> => getData(STORAGE_KEYS.academics, initialAcademics),
  createAcademic: async (data: Omit<CareerAcademic, "id" | "createdAt">): Promise<CareerAcademic> => {
    const list = getData(STORAGE_KEYS.academics, initialAcademics);
    const newItem: CareerAcademic = { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    setData(STORAGE_KEYS.academics, [newItem, ...list]);
    return newItem;
  },
  updateAcademic: async (id: string, data: Partial<CareerAcademic>): Promise<CareerAcademic> => {
    const list = getData(STORAGE_KEYS.academics, initialAcademics);
    const index = list.findIndex(x => x.id === id);
    if (index === -1) throw new Error("Not found");
    const updated = { ...list[index], ...data };
    list[index] = updated;
    setData(STORAGE_KEYS.academics, list);
    return updated;
  },
  deleteAcademic: async (id: string): Promise<void> => {
    const list = getData(STORAGE_KEYS.academics, initialAcademics);
    setData(STORAGE_KEYS.academics, list.filter(x => x.id !== id));
  },

  getSkills: async (): Promise<CareerSkill[]> => getData(STORAGE_KEYS.skills, initialSkills),
  createSkill: async (data: Omit<CareerSkill, "id" | "createdAt">): Promise<CareerSkill> => {
    const list = getData(STORAGE_KEYS.skills, initialSkills);
    const newItem: CareerSkill = { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    setData(STORAGE_KEYS.skills, [newItem, ...list]);
    return newItem;
  },
  updateSkill: async (id: string, data: Partial<CareerSkill>): Promise<CareerSkill> => {
    const list = getData(STORAGE_KEYS.skills, initialSkills);
    const index = list.findIndex(x => x.id === id);
    if (index === -1) throw new Error("Not found");
    const updated = { ...list[index], ...data };
    list[index] = updated;
    setData(STORAGE_KEYS.skills, list);
    return updated;
  },
  deleteSkill: async (id: string): Promise<void> => {
    const list = getData(STORAGE_KEYS.skills, initialSkills);
    setData(STORAGE_KEYS.skills, list.filter(x => x.id !== id));
  },

  getCredentials: async (): Promise<CareerCredential[]> => getData(STORAGE_KEYS.credentials, initialCredentials),
  createCredential: async (data: Omit<CareerCredential, "id" | "createdAt">): Promise<CareerCredential> => {
    const list = getData(STORAGE_KEYS.credentials, initialCredentials);
    const newItem: CareerCredential = { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    setData(STORAGE_KEYS.credentials, [newItem, ...list]);
    return newItem;
  },
  updateCredential: async (id: string, data: Partial<CareerCredential>): Promise<CareerCredential> => {
    const list = getData(STORAGE_KEYS.credentials, initialCredentials);
    const index = list.findIndex(x => x.id === id);
    if (index === -1) throw new Error("Not found");
    const updated = { ...list[index], ...data };
    list[index] = updated;
    setData(STORAGE_KEYS.credentials, list);
    return updated;
  },
  deleteCredential: async (id: string): Promise<void> => {
    const list = getData(STORAGE_KEYS.credentials, initialCredentials);
    setData(STORAGE_KEYS.credentials, list.filter(x => x.id !== id));
  },

  getLanguages: async (): Promise<CareerLanguage[]> => getData(STORAGE_KEYS.languages, initialLanguages),
  createLanguage: async (data: Omit<CareerLanguage, "id" | "createdAt">): Promise<CareerLanguage> => {
    const list = getData(STORAGE_KEYS.languages, initialLanguages);
    const newItem: CareerLanguage = { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    setData(STORAGE_KEYS.languages, [newItem, ...list]);
    return newItem;
  },
  updateLanguage: async (id: string, data: Partial<CareerLanguage>): Promise<CareerLanguage> => {
    const list = getData(STORAGE_KEYS.languages, initialLanguages);
    const index = list.findIndex(x => x.id === id);
    if (index === -1) throw new Error("Not found");
    const updated = { ...list[index], ...data };
    list[index] = updated;
    setData(STORAGE_KEYS.languages, list);
    return updated;
  },
  deleteLanguage: async (id: string): Promise<void> => {
    const list = getData(STORAGE_KEYS.languages, initialLanguages);
    setData(STORAGE_KEYS.languages, list.filter(x => x.id !== id));
  },

  getAchievements: async (): Promise<CareerAchievement[]> => getData(STORAGE_KEYS.achievements, initialAchievements),
  createAchievement: async (data: Omit<CareerAchievement, "id" | "createdAt">): Promise<CareerAchievement> => {
    const list = getData(STORAGE_KEYS.achievements, initialAchievements);
    const newItem: CareerAchievement = { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    setData(STORAGE_KEYS.achievements, [newItem, ...list]);
    return newItem;
  },
  updateAchievement: async (id: string, data: Partial<CareerAchievement>): Promise<CareerAchievement> => {
    const list = getData(STORAGE_KEYS.achievements, initialAchievements);
    const index = list.findIndex(x => x.id === id);
    if (index === -1) throw new Error("Not found");
    const updated = { ...list[index], ...data };
    list[index] = updated;
    setData(STORAGE_KEYS.achievements, list);
    return updated;
  },
  deleteAchievement: async (id: string): Promise<void> => {
    const list = getData(STORAGE_KEYS.achievements, initialAchievements);
    setData(STORAGE_KEYS.achievements, list.filter(x => x.id !== id));
  },
};
