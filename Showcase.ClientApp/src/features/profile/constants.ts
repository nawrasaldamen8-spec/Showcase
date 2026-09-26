export const SUPPORTED_PLATFORMS = [
  "GitHub",
  "LinkedIn",
  "Website",
  "Behance",
  "Dribbble",
  "X",
  "Instagram",
  "Custom",
] as const;

export type SupportedPlatform = (typeof SUPPORTED_PLATFORMS)[number];

export const PLATFORM_PLACEHOLDERS: Record<string, string> = {
  GitHub: "https://github.com/yourusername",
  LinkedIn: "https://linkedin.com/in/yourusername",
  Website: "https://yourportfolio.com",
  Behance: "https://behance.net/yourusername",
  Dribbble: "https://dribbble.com/yourusername",
  X: "https://x.com/yourhandle",
  Instagram: "https://instagram.com/yourhandle",
  Custom: "https://example.com/profile",
};

export const CREATIVE_SPECIALTIES = [
  "Software Engineering & Architecture",
  "UI/UX & Product Design",
  "Frontend & Web Development",
  "Backend & Distributed Systems",
  "Graphic & Brand Design",
  "Architecture & Spatial Design",
  "Architectural Photography",
  "Documentary Photography",
  "Data Science & Machine Learning",
  "Creative Technology",
  "Product Management",
  "Content Writing & Editorial",
  "3D Motion & Visual Effects",
  "Industrial & Hardware Design",
  "Sound Design & Audio Engineering",
  "Fine Art & Illustration",
] as const;

export type CreativeSpecialty = (typeof CREATIVE_SPECIALTIES)[number];

