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
  Custom: "https://external-archive.org/profile",
};
