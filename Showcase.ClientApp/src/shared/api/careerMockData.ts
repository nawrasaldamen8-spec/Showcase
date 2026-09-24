import type {
  CareerExperience,
  CareerAcademic,
  CareerSkill,
  CareerCredential,
  CareerLanguage,
  CareerAchievement,
} from "../types/career.ts";

export const initialExperiences: CareerExperience[] = [
  {
    id: "exp-1",
    company: "Studio Vance Spatial Research",
    jobTitle: "Principal Architectural Documentarian",
    startDate: "2020-05",
    currentlyWorking: true,
    employmentType: "Full-time",
    location: "Copenhagen, Denmark",
    description: "Documenting spatial interventions and light phenomena.",
    achievements: "Curated 14 exhibitions; co-authored daylight monograph",
    skillsUsed: ["Architectural Curation", "Daylight Scenography", "Medium Format"],
    createdAt: "2024-01-01T00:00:00Z",
  },
];

export const initialAcademics: CareerAcademic[] = [
  {
    id: "aca-1",
    institution: "Royal Danish Academy of Fine Arts (KADK)",
    degree: "Master of Architecture",
    fieldOfStudy: "Spatial Design & Daylight",
    startDate: "2016-09",
    endDate: "2018-06",
    currentlyStudying: false,
    location: "Copenhagen, Denmark",
    gpa: "First Class Distinction",
    description: "Focus on Nordic light.",
    achievements: "Dean's List",
    createdAt: "2024-01-01T00:00:00Z",
  },
];

export const initialSkills: CareerSkill[] = [
  {
    id: "skl-1",
    name: "Architectural Daylight Scenography",
    category: "Design",
    createdAt: "2024-01-01T00:00:00Z",
  },
];

export const initialCredentials: CareerCredential[] = [
  {
    id: "crd-1",
    name: "Certified Spatial Scenographer",
    issuingOrganization: "Royal Institute of British Architects (RIBA)",
    issueDate: "2019-08",
    credentialId: "RIBA-SS-99201",
    createdAt: "2024-01-01T00:00:00Z",
  },
];

export const initialLanguages: CareerLanguage[] = [
  {
    id: "lan-1",
    language: "Danish",
    proficiency: "Native",
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "lan-2",
    language: "English",
    proficiency: "Fluent",
    createdAt: "2024-01-01T00:00:00Z",
  },
];

export const initialAchievements: CareerAchievement[] = [
  {
    id: "ach-1",
    title: "Golden Shutter Award",
    type: "Award",
    date: "2022-11",
    organization: "Venice Biennale of Architecture",
    description: "Awarded for best architectural documentary.",
    createdAt: "2024-01-01T00:00:00Z",
  },
];
