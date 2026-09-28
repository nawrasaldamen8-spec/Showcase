export const ACADEMIC_DEGREE_OPTIONS = [
  "Bachelor of Arts (BA)",
  "Bachelor of Science (BS)",
  "Bachelor of Fine Arts (BFA)",
  "Bachelor of Architecture (B.Arch)",
  "Bachelor of Design (B.Des)",
  "Master of Arts (MA)",
  "Master of Science (MS)",
  "Master of Fine Arts (MFA)",
  "Master of Design (M.Des)",
  "Doctor of Philosophy (Ph.D.)",
  "Associate Degree",
  "High School Diploma",
  "Bootcamp Certificate",
  "Professional Diploma",
  "Self-Taught / Informal Education",
  "Other",
];

export const ACHIEVEMENT_TYPES = [
  "Design Award",
  "Exhibition",
  "Publication",
  "Competition",
  "Patent",
  "Keynote Speaker",
  "Grant / Fellowship",
  "Press Feature",
  "Hackathon Winner",
  "Industry Recognition",
  "Community Contributor",
  "Other",
];

export const PREDEFINED_LANGUAGES = [
  "English",
  "Arabic",
  "Spanish",
  "French",
  "German",
  "Mandarin Chinese",
  "Japanese",
  "Korean",
  "Russian",
  "Italian",
  "Portuguese",
  "Dutch",
  "Swedish",
  "Turkish",
  "Hindi",
  "Other",
];

export const PROFICIENCY_LEVELS = [
  "Native",
  "Bilingual",
  "Fluent",
  "Full Professional",
  "Professional Working",
  "Advanced",
  "Intermediate",
  "Limited Working",
  "Elementary",
  "Beginner",
];

export const SKILL_CATEGORIES = [
  "Creative & Art Direction",
  "Visual & Brand Design",
  "Product & UI/UX Design",
  "Frontend Development",
  "Backend Development",
  "Full-Stack Engineering",
  "Mobile App Development",
  "3D & Motion Design",
  "Photography & Cinematography",
  "Content Strategy & Copywriting",
  "Leadership & Management",
  "Architecture & Spatial Design",
  "Tools & Frameworks",
  "Other",
];

export function getLanguageProficiencyPercentage(proficiency?: string): number {
  switch (proficiency?.toLowerCase()) {
    case "native":
    case "bilingual":
      return 100;
    case "fluent":
    case "full professional":
      return 85;
    case "professional working":
    case "advanced":
      return 70;
    case "intermediate":
    case "limited working":
      return 50;
    case "elementary":
    case "beginner":
      return 30;
    default:
      return 60;
  }
}
