import type { WizardStepNumber } from "./hooks/usePostEditor.ts";

export interface WizardStepMeta {
  step: WizardStepNumber;
  label: string;
  title: string;
  description: string;
}

export const WIZARD_STEPS: readonly WizardStepMeta[] = [
  {
    step: 1,
    label: "Media",
    title: "Project Images",
    description:
      "Upload and arrange your project images. The primary cover image will be shown first.",
  },
  {
    step: 2,
    label: "Identity",
    title: "Project Identity",
    description: "Enter your project title and an optional link to the live demo or repository.",
  },
  {
    step: 3,
    label: "Editorial",
    title: "Description & Tags",
    description:
      "Provide a description of your work and select relevant tags to improve discoverability.",
  },
  {
    step: 4,
    label: "Review",
    title: "Review & Publish",
    description: "Review your project details before publishing live or saving as a draft.",
  },
] as const;

export const SUGGESTED_TAGS = ["UI/UX", "Photography", "Architecture", "Branding", "Engineering", "Editorial"];
