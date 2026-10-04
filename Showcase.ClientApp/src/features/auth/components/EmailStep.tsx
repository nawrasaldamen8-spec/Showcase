import React from "react";
import { ArrowLeft, ArrowRight, Info, Mail, SkipForward } from "lucide-react";
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
  return (
    <form onSubmit={onNext} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="reg-email"
            className="flex items-center gap-2 font-gothic text-xs font-bold uppercase tracking-wider text-slate-dark"
          >
            <Mail className="w-3.5 h-3.5 text-cloud-dark" />
            <span>Email Address</span>
          </label>
          <span className="font-serif text-[11px] text-cloud-dark italic">
            Optional
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
        />
      </div>

      <div className="p-3 bg-stone/20 border border-stone/60 rounded-xl flex items-start gap-2.5">
        <Info className="w-4 h-4 text-cloud-dark shrink-0 mt-0.5" />
        <p className="font-serif text-xs text-cloud-dark leading-relaxed">
          Email is completely optional. Linking an email makes account recovery and editorial notifications possible, but you can always add it later in Account Settings.
        </p>
      </div>

      <div className="pt-2 flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={onBack}
          leftIcon={<ArrowLeft className="w-4 h-4" />}
          className="font-gothic uppercase tracking-wider text-xs"
        >
          Back
        </Button>

        <div className="flex items-center gap-2 flex-1 justify-end">
          <Button
            type="button"
            variant="ghost"
            size="lg"
            onClick={onSkip}
            leftIcon={<SkipForward className="w-4 h-4" />}
            className="font-gothic uppercase tracking-wider text-xs text-cloud-dark hover:text-slate-dark"
          >
            Skip
          </Button>
          <Button
            type="submit"
            variant="clay"
            size="lg"
            rightIcon={<ArrowRight className="w-4 h-4" />}
            className="font-gothic uppercase tracking-wider text-xs justify-center flex-1"
          >
            Continue
          </Button>
        </div>
      </div>
    </form>
  );
};
