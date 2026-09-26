import type {
  CareerExperience,
  CareerAcademic,
  CareerSkill,
  CareerCredential,
  CareerLanguage,
  CareerAchievement,
  CareerVisibilitySettings,
} from "../types/career.ts";

export const initialCareerVisibility: CareerVisibilitySettings = {
  experience: true,
  academics: true,
  skills: true,
  credentials: true,
  languages: true,
  achievements: true,
};

export const initialExperiences: CareerExperience[] = [];
export const initialAcademics: CareerAcademic[] = [];
export const initialSkills: CareerSkill[] = [];
export const initialCredentials: CareerCredential[] = [];
export const initialLanguages: CareerLanguage[] = [];
export const initialAchievements: CareerAchievement[] = [];
