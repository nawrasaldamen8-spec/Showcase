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
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <label
          htmlFor="reg-name"
          className="flex items-center gap-2 font-gothic text-xs font-bold uppercase tracking-wider text-slate-dark"
        >
          <User className="w-3.5 h-3.5 text-cloud-dark" />
          <span>Full Name or Practice Title <span className="text-clay">*</span></span>
        </label>
        <Input
          id="reg-name"
          type="text"
          placeholder="e.g. Elena Vance or Studio Monolith"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoFocus
          autoComplete="name"
          enterKeyHint="next"
          className="min-h-[46px]"
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
          type="submit"
          variant="clay"
          size="md"
          disabled={!name.trim()}
          rightIcon={<ArrowRight className="w-4 h-4" />}
          className="font-gothic uppercase tracking-wider text-xs"
        >
          Continue
        </Button>
      </div>
    </form>
  );
};
