/**
 * Showcase Portfolio Platform — Career Module Domain Contracts
 * Aligned with Warm Gallery editorial aesthetics and ASP.NET Core Clean Architecture.
 */

export interface CareerExperience {
  id: string;
  company: string;
  jobTitle: string;
  startDate: string; // YYYY-MM
  endDate?: string; // YYYY-MM
  currentlyWorking?: boolean;
  employmentType?: string;
  location?: string;
  description?: string;
  achievements?: string;
  skillsUsed?: string[];
  createdAt: string;
}

export interface CareerAcademic {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string; // YYYY-MM
  endDate?: string; // YYYY-MM
  currentlyStudying?: boolean;
  location?: string;
  description?: string;
  gpa?: string;
  achievements?: string;
  createdAt: string;
}

export type SkillCategory = 'Technical' | 'Design' | 'Leadership' | 'Tools' | 'General';

export interface CareerSkill {
  id: string;
  name: string;
  category?: string;
  createdAt: string;
}

export interface CareerCredential {
  id: string;
  name: string;
  issuingOrganization: string;
  issueDate?: string;
  expirationDate?: string;
  credentialId?: string;
  verificationUrl?: string;
  mediaUrl?: string;
  createdAt: string;
}

export type LanguageProficiency = 'Native' | 'Fluent' | 'Professional' | 'Intermediate' | 'Basic';

export interface CareerLanguage {
  id: string;
  language: string;
  proficiency: LanguageProficiency | string;
  createdAt: string;
}

export interface CareerAchievement {
  id: string;
  title: string;
  type?: string;
  date?: string;
  organization?: string;
  description?: string;
  url?: string;
  mediaUrl?: string;
  createdAt: string;
}

export interface CareerSummary {
  experienceCount: number;
  academicsCount: number;
  skillsCount: number;
  credentialsCount: number;
  languagesCount: number;
  achievementsCount: number;
}
