import React from "react";
import { ArrowLeft, ArrowRight, FileText } from "lucide-react";
import { Button } from "@shared/components/Button.tsx";

export interface BioStepProps {
  bio: string;
  setBio: (value: string) => void;
  onBack: () => void;
  onNext: () => void;
}

export const BioStep: React.FC<BioStepProps> = ({
  bio,
  setBio,
  onBack,
  onNext,
}) => {
  const maxLength = 500;

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="reg-bio"
            className="flex items-center gap-2 font-gothic text-xs font-bold uppercase tracking-wider text-slate-dark"
          >
            <FileText className="w-3.5 h-3.5 text-cloud-dark" />
            <span>Biography <span className="font-serif text-[11px] font-normal text-cloud-dark">(Optional)</span></span>
          </label>
          <span className="font-serif text-xs text-cloud-dark">
            {bio.length} / {maxLength}
          </span>
        </div>

        <textarea
          id="reg-bio"
          rows={4}
          maxLength={maxLength}
          placeholder="Briefly describe your background, studio practice, or creative focus..."
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="w-full rounded-xl border border-stone bg-ivory-light p-3.5 font-serif text-sm text-slate-dark placeholder-cloud-dark/70 focus:border-slate-dark focus:outline-none transition-colors leading-relaxed shadow-none resize-none"
        />
      </div>

      <div className="pt-2 flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          size="md"
          onClick={onBack}
          leftIcon={<ArrowLeft className="w-4 h-4" />}
          className="font-gothic uppercase tracking-wider text-xs"
        >
          Back
        </Button>

        <Button
          type="button"
          variant="clay"
          size="md"
          onClick={onNext}
          rightIcon={<ArrowRight className="w-4 h-4" />}
          className="font-gothic uppercase tracking-wider text-xs"
        >
          {bio.trim() ? "Continue" : "Skip"}
        </Button>
      </div>
    </div>
  );
};
