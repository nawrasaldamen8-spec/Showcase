import React from "react";
import { ArrowLeft, ArrowRight, FileText, Sparkles } from "lucide-react";
import { Button } from "@shared/components/Button.tsx";

export interface BioStepProps {
  bio: string;
  setBio: (value: string) => void;
  onBack: () => void;
  onNext: () => void;
}

const PROMPTS = [
  "Architectural designer focusing on sustainable concrete monoliths...",
  "Spatial researcher investigating parametric façades and urban density...",
  "Interior curator blending brutalist geometry with natural Scandinavian textures...",
];

export const BioStep: React.FC<BioStepProps> = ({
  bio,
  setBio,
  onBack,
  onNext,
}) => {
  const maxLength = 500;

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-clay" />
          <h3 className="font-gothic font-bold text-base sm:text-lg uppercase tracking-tight text-slate-dark">
            Curatorial Statement &amp; Bio
          </h3>
        </div>
        <p className="font-serif text-sm text-slate-dark/75 leading-relaxed">
          Introduce your architectural ethos, studio trajectory, or creative focus.
          This will appear prominently in your public portfolio and exhibition plates.
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label
            htmlFor="reg-bio"
            className="font-gothic text-xs font-bold uppercase tracking-wider text-slate-dark"
          >
            Biography <span className="font-serif text-[11px] font-normal text-cloud-dark">(Optional)</span>
          </label>
          <span className="font-serif text-xs text-cloud-dark">
            {bio.length} / {maxLength}
          </span>
        </div>

        <textarea
          id="reg-bio"
          rows={5}
          maxLength={maxLength}
          placeholder="Briefly describe your design trajectory, ongoing research, or studio ethos..."
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="w-full rounded-2xl border border-stone bg-ivory-light p-4 font-serif text-sm text-slate-dark placeholder-cloud-dark/70 focus:border-slate-dark focus:outline-none transition-colors leading-relaxed shadow-none resize-none"
        />
      </div>

      {/* Suggested Inceptions */}
      <div className="space-y-2 pt-1">
        <span className="font-gothic text-[10px] font-bold uppercase tracking-wider text-cloud-dark flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-clay" />
          Suggested prompts (tap to apply):
        </span>
        <div className="flex flex-col gap-1.5">
          {PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setBio(prompt)}
              className="text-left font-serif text-xs text-slate-dark/75 hover:text-clay hover:bg-stone/20 p-2 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-stone/60"
            >
              &ldquo;{prompt}&rdquo;
            </button>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="pt-4 border-t border-stone/50 flex flex-col sm:flex-row items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={onBack}
          leftIcon={<ArrowLeft className="w-4 h-4" />}
          className="w-full sm:w-auto font-gothic uppercase tracking-wider text-xs justify-center min-h-[48px]"
        >
          Back
        </Button>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {!bio.trim() && (
            <Button
              type="button"
              variant="ghost"
              size="lg"
              onClick={onNext}
              className="w-full sm:w-auto font-gothic uppercase tracking-wider text-xs text-cloud-dark hover:text-slate-dark justify-center min-h-[48px]"
            >
              Skip for Now
            </Button>
          )}
          <Button
            type="button"
            variant="clay"
            size="lg"
            onClick={onNext}
            rightIcon={<ArrowRight className="w-4 h-4" />}
            className="w-full sm:w-auto font-gothic uppercase tracking-wider text-xs justify-center min-h-[48px]"
          >
            Next: Specialty
          </Button>
        </div>
      </div>
    </div>
  );
};
