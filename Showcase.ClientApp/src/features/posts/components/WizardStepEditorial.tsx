import React from "react";
import { BookOpen, Sparkles } from "lucide-react";
import { Textarea } from "@shared/components/Textarea.tsx";

export interface WizardStepEditorialProps {
  description: string;
  setDescription: (val: string) => void;
  descriptionError: string | null;
  setDescriptionError: (msg: string | null) => void;
  setIsDirty: (dirty: boolean) => void;
}

const EDITORIAL_PROMPTS = [
  "Site & Context: What spatial or environmental conditions shaped this structure?",
  "Methodology & Materiality: Which tectonics, concrete blends, or timber joints were chosen and why?",
  "Spatial Experience: How does natural illumination or circulation animate the interior spaces?",
];

export const WizardStepEditorial: React.FC<WizardStepEditorialProps> = ({
  description,
  setDescription,
  descriptionError,
  setDescriptionError,
  setIsDirty,
}) => {
  return (
    <div className="bg-ivory-light border border-stone rounded-card p-6 sm:p-8 space-y-6 shadow-none">
      <div className="space-y-1.5 border-b border-stone/50 pb-5">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-clay" />
          <h3 className="font-gothic font-bold text-base sm:text-lg uppercase tracking-tight text-slate-dark">
            Curatorial Statement &amp; Narrative
          </h3>
        </div>
        <p className="font-serif text-sm text-slate-dark/75 leading-relaxed">
          Articulate the conceptual framework, architectural methodology, and spatial context of the project.
          This editorial text will accompany your high-resolution images in the exhibition plate.
        </p>
      </div>

      <div>
        <Textarea
          label="Curatorial Statement *"
          placeholder="Articulate the project trajectory, spatial intentions, and technical execution..."
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            setIsDirty(true);
            if (descriptionError) setDescriptionError(null);
          }}
          rows={9}
          showCount
          maxLength={2000}
          errorMessage={descriptionError || undefined}
          helperText="Required. A thoughtful statement gives meaning and architectural context to your visuals."
          className="font-serif text-sm leading-relaxed"
        />
      </div>

      {/* Editorial Guidance Box */}
      <div className="p-4 rounded-2xl bg-ivory-medium/50 border border-stone/70 space-y-2.5">
        <div className="flex items-center gap-1.5 font-gothic text-xs font-bold uppercase tracking-wider text-slate-dark">
          <Sparkles className="w-3.5 h-3.5 text-clay" />
          <span>Curatorial Prompts to Consider:</span>
        </div>
        <ul className="space-y-1.5 font-serif text-xs text-slate-dark/80 list-disc list-inside">
          {EDITORIAL_PROMPTS.map((prompt, idx) => (
            <li key={idx} className="leading-relaxed">
              {prompt}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
