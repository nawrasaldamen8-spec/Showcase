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
    title: "Visual Assets & Cover",
    description: "Upload and curate your architectural photography, drawings, and renders. The primary cover plate is presented first.",
  },
  {
    step: 2,
    label: "Identity",
    title: "Project Identity",
    description: "Define the official project title and optional live documentation or exhibition reference link.",
  },
  {
    step: 3,
    label: "Narrative",
    title: "Curatorial Statement",
    description: "Articulate the conceptual framework, architectural methodology, and spatial context of the project.",
  },
  {
    step: 4,
    label: "Taxonomy",
    title: "Tags & Classification",
    description: "Select architectural disciplines, typologies, and materials to situate this work in the public catalog.",
  },
  {
    step: 5,
    label: "Review",
    title: "Exhibition Review",
    description: "Inspect the project plate as visitors will experience it before final publication or saving to studio drafts.",
  },
] as const;

export const SUGGESTED_TAG_CATEGORIES = [
  {
    category: "Typology",
    tags: ["Residential", "Commercial", "Cultural", "Public Pavilion", "Urban Landscape", "Adaptive Reuse"],
  },
  {
    category: "Materiality",
    tags: ["Concrete", "Timber", "Stone", "Glass Façade", "Steel", "Rammed Earth"],
  },
  {
    category: "Discipline",
    tags: ["Architecture", "Interior Architecture", "Parametric Design", "Sustainability", "Restoration", "Theory"],
  },
];

export const SUGGESTED_TAGS = [
  "Architecture",
  "Interior Architecture",
  "Parametric Design",
  "Residential",
  "Concrete",
  "Timber",
  "Public Pavilion",
  "Sustainability",
];

export const MAX_POST_IMAGES = 6;
