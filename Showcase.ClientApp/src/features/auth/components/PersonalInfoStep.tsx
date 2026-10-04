import React from "react";
import { ArrowLeft, ArrowRight, User } from "lucide-react";
import { Button } from "@shared/components/Button.tsx";
import { Input } from "@shared/components/Input.tsx";

export interface PersonalInfoStepProps {
  name: string;
  setName: (value: string) => void;
  onBack: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const PersonalInfoStep: React.FC<PersonalInfoStepProps> = ({
  name,
  setName,
  onBack,
  onSubmit,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      <div className="space-y-1.5 border-b border-stone/50 pb-4">
        <h3 className="font-gothic font-bold text-base sm:text-lg uppercase tracking-tight text-slate-dark">
          Creator Identity
        </h3>
        <p className="font-serif text-sm text-slate-dark/75 leading-relaxed">
          Specify your practitioner or practice name as displayed across Pority.
        </p>
      </div>

      {/* Full Name */}
      <div className="space-y-1.5">
        <Input
          id="reg-name"
          label="Full Name or Practice Title *"
          type="text"
          placeholder="e.g. Elena Vance or Studio Monolith"
          value={name}
          onChange={(e) => setName(e.target.value)}
          leftIcon={<User className="w-4 h-4" />}
          required
          autoFocus
          autoComplete="name"
          enterKeyHint="next"
          className="min-h-[46px]"
          helperText="This title is displayed on your portfolio header and exhibition plates."
        />
      </div>

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
        <Button
          type="submit"
          variant="clay"
          size="lg"
          rightIcon={<ArrowRight className="w-4 h-4" />}
          className="w-full sm:w-auto font-gothic uppercase tracking-wider text-xs justify-center min-h-[48px]"
        >
          Next: Biography
        </Button>
      </div>
    </form>
  );
};
