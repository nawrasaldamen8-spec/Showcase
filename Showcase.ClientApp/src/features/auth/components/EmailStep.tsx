import React from "react";
import { ArrowLeft, ArrowRight, Mail } from "lucide-react";
import { Button } from "@shared/components/Button.tsx";
import { Input } from "@shared/components/Input.tsx";

export interface EmailStepProps {
  email: string;
  setEmail: (value: string) => void;
  onBack: () => void;
  onNext: (e: React.FormEvent) => void;
  onSkip: () => void;
}

export const EmailStep: React.FC<EmailStepProps> = ({
  email,
  setEmail,
  onBack,
  onNext,
  onSkip,
}) => {
  const hasEmail = Boolean(email.trim());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hasEmail) {
      onNext(e);
    } else {
      onSkip();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="reg-email"
            className="flex items-center gap-2 font-gothic text-xs font-bold uppercase tracking-wider text-slate-dark"
          >
            <Mail className="w-3.5 h-3.5 text-cloud-dark" />
            <span>Email Address</span>
          </label>
          <span className="font-serif text-[11px] text-cloud-dark">
            (Optional)
          </span>
        </div>
        <Input
          id="reg-email"
          type="email"
          placeholder="e.g. elena@studio-vance.design"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoFocus
          autoComplete="email"
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
          rightIcon={<ArrowRight className="w-4 h-4" />}
          className="font-gothic uppercase tracking-wider text-xs"
        >
          {hasEmail ? "Continue" : "Skip"}
        </Button>
      </div>
    </form>
  );
};
