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
    title: "Exhibition Plates",
    description:
      "Upload and arrange high-resolution visual plates. The first plate serves as the primary exhibition cover.",
  },
  {
    step: 2,
    label: "Identity",
    title: "Artwork Identity",
    description: "Define a commanding project title and an optional external live reference or repository link.",
  },
  {
    step: 3,
    label: "Editorial",
    title: "Statement & Tags",
    description:
      "Craft an intellectual exhibition statement in Anthropic Serif, and assign categorical tags for discoverability.",
  },
  {
    step: 4,
    label: "Review",
    title: "Curatorial Review",
    description: "Perform a final curatorial assessment before publishing publicly or securing as a private draft.",
  },
] as const;

export const SUGGESTED_TAGS = ["UI/UX", "Photography", "Architecture", "Branding", "Engineering", "Editorial"];
