import React, { useState } from "react";
import { ArrowLeft, ArrowRight, Search, Sparkles, X } from "lucide-react";
import { Button } from "@shared/components/Button.tsx";
import { SpecialtyPickerModal } from "./SpecialtyPickerModal.tsx";

export interface SpecialtyStepProps {
  specialty: string | null;
  onSpecialtyChange: (value: string | null) => void;
  onBack: () => void;
  onNext: (selectedSpecialty: string | null) => void;
}

export const SpecialtyStep: React.FC<SpecialtyStepProps> = ({
  specialty,
  onSpecialtyChange,
  onBack,
  onNext,
}) => {
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  return (
    <div className="space-y-4">
      {/* Field Label */}
      <div className="space-y-1.5">
        <label className="flex items-center gap-2 font-gothic text-xs font-bold uppercase tracking-wider text-slate-dark">
          <Sparkles className="w-3.5 h-3.5 text-clay" />
          <span>
            Primary Specialty / Field{" "}
            <span className="font-serif text-[11px] font-normal text-cloud-dark">(Optional)</span>
          </span>
        </label>

        {/* Selected Specialty Badge or Selection Trigger */}
        {specialty ? (
          <div className="min-h-[46px] p-3 rounded-xl bg-ivory-medium/40 border border-stone/70 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <Sparkles className="w-4 h-4 text-clay shrink-0" />
              <span className="font-serif text-sm font-semibold text-slate-dark truncate">
                {specialty}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsPickerOpen(true)}
                className="font-gothic text-[11px] font-bold uppercase tracking-wider text-clay hover:underline cursor-pointer"
              >
                Change
              </button>
              <button
                type="button"
                onClick={() => onSpecialtyChange(null)}
                className="p-1 text-cloud-dark hover:text-slate-dark transition-colors cursor-pointer"
                aria-label="Clear selected specialty"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsPickerOpen(true)}
            className="w-full min-h-[46px] px-3.5 py-2.5 rounded-xl bg-ivory-medium/30 hover:bg-ivory-medium/60 border border-stone/70 text-cloud-dark hover:text-slate-dark flex items-center justify-between transition-colors cursor-pointer text-left"
          >
            <span className="font-serif text-sm">Select your field or discipline...</span>
            <Search className="w-4 h-4 text-cloud-dark" />
          </button>
        )}
      </div>

      {/* Navigation Buttons */}
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
          onClick={() => onNext(specialty)}
          rightIcon={<ArrowRight className="w-4 h-4" />}
          className="font-gothic uppercase tracking-wider text-xs"
        >
          {specialty ? "Continue" : "Skip"}
        </Button>
      </div>

      {/* Modal Picker */}
      <SpecialtyPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        selectedSpecialty={specialty}
        onSelect={onSpecialtyChange}
      />
    </div>
  );
};
