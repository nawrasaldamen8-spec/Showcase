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
import { createMockCrud } from "./mockCrudFactory.ts";

const STORAGE_KEYS = {
  experiences: "showcase_career_experiences",
  academics: "showcase_career_academics",
  skills: "showcase_career_skills",
  credentials: "showcase_career_credentials",
  languages: "showcase_career_languages",
  achievements: "showcase_career_achievements",
};

const experienceMock = createMockCrud<CareerExperience>({
  storageKey: STORAGE_KEYS.experiences,
  defaultData: initialExperiences,
  prependOnCreate: true,
  delay: 0,
});

const academicMock = createMockCrud<CareerAcademic>({
  storageKey: STORAGE_KEYS.academics,
  defaultData: initialAcademics,
  prependOnCreate: true,
  delay: 0,
});

const skillMock = createMockCrud<CareerSkill>({
  storageKey: STORAGE_KEYS.skills,
  defaultData: initialSkills,
  prependOnCreate: true,
  delay: 0,
});

const credentialMock = createMockCrud<CareerCredential>({
  storageKey: STORAGE_KEYS.credentials,
  defaultData: initialCredentials,
  prependOnCreate: true,
  delay: 0,
});

const languageMock = createMockCrud<CareerLanguage>({
  storageKey: STORAGE_KEYS.languages,
  defaultData: initialLanguages,
  prependOnCreate: true,
  delay: 0,
});

const achievementMock = createMockCrud<CareerAchievement>({
  storageKey: STORAGE_KEYS.achievements,
  defaultData: initialAchievements,
  prependOnCreate: true,
  delay: 0,
});

export const careerMockService = {
  getCareerSummary: async (): Promise<CareerSummary> => {
    const [experiences, academics, skills, credentials, languages, achievements] = await Promise.all([
      experienceMock.getAll(),
      academicMock.getAll(),
      skillMock.getAll(),
      credentialMock.getAll(),
      languageMock.getAll(),
      achievementMock.getAll(),
    ]);
    return {
      experienceCount: experiences.length,
      academicsCount: academics.length,
      skillsCount: skills.length,
      credentialsCount: credentials.length,
      languagesCount: languages.length,
      achievementsCount: achievements.length,
    };
  },
  getExperiences: () => experienceMock.getAll(),
  createExperience: (data: Omit<CareerExperience, "id" | "createdAt">) => experienceMock.create(data),
  updateExperience: (id: string, data: Partial<CareerExperience>) => experienceMock.update(id, data),
  deleteExperience: (id: string) => experienceMock.delete(id),

  getAcademics: () => academicMock.getAll(),
  createAcademic: (data: Omit<CareerAcademic, "id" | "createdAt">) => academicMock.create(data),
  updateAcademic: (id: string, data: Partial<CareerAcademic>) => academicMock.update(id, data),
  deleteAcademic: (id: string) => academicMock.delete(id),

  getSkills: () => skillMock.getAll(),
  createSkill: (data: Omit<CareerSkill, "id" | "createdAt">) => skillMock.create(data),
  updateSkill: (id: string, data: Partial<CareerSkill>) => skillMock.update(id, data),
  deleteSkill: (id: string) => skillMock.delete(id),

  getCredentials: () => credentialMock.getAll(),
  createCredential: (data: Omit<CareerCredential, "id" | "createdAt">) => credentialMock.create(data),
  updateCredential: (id: string, data: Partial<CareerCredential>) => credentialMock.update(id, data),
  deleteCredential: (id: string) => credentialMock.delete(id),

  getLanguages: () => languageMock.getAll(),
  createLanguage: (data: Omit<CareerLanguage, "id" | "createdAt">) => languageMock.create(data),
  updateLanguage: (id: string, data: Partial<CareerLanguage>) => languageMock.update(id, data),
  deleteLanguage: (id: string) => languageMock.delete(id),

  getAchievements: () => achievementMock.getAll(),
  createAchievement: (data: Omit<CareerAchievement, "id" | "createdAt">) => achievementMock.create(data),
  updateAchievement: (id: string, data: Partial<CareerAchievement>) => achievementMock.update(id, data),
  deleteAchievement: (id: string) => achievementMock.delete(id),
};
