import React from "react";
import { BookOpen } from "lucide-react";
import { Textarea } from "@shared/components/Textarea.tsx";

export interface WizardStepEditorialProps {
  description: string;
  setDescription: (val: string) => void;
  descriptionError: string | null;
  setDescriptionError: (msg: string | null) => void;
  setIsDirty: (dirty: boolean) => void;
}

export const WizardStepEditorial: React.FC<WizardStepEditorialProps> = ({
  description,
  setDescription,
  descriptionError,
  setDescriptionError,
  setIsDirty,
}) => {
  return (
    <div className="bg-ivory-light border border-stone rounded-card p-6 sm:p-8 space-y-6 shadow-none">
      <div className="space-y-1 border-b border-stone/50 pb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-clay" />
          <h3 className="font-gothic font-bold text-base sm:text-lg uppercase tracking-tight text-slate-dark">
            Project Description
          </h3>
        </div>
      </div>

      <div>
        <Textarea
          label="Description (Optional)"
          placeholder="Brief description or notes about the project..."
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            setIsDirty(true);
            if (descriptionError) setDescriptionError(null);
          }}
          rows={7}
          showCount
          maxLength={2000}
          errorMessage={descriptionError || undefined}
          className="font-serif text-sm leading-relaxed"
        />
      </div>
    </div>
  );
};
