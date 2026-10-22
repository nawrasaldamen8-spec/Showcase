import React from "react";
import { ArrowLeft, ArrowRight, Lock } from "lucide-react";
import { Button } from "@shared/components/Button.tsx";
import { Input } from "@shared/components/Input.tsx";
import { PasswordStrengthMeter } from "./PasswordStrengthMeter.tsx";

export interface PasswordStepProps {
  password: string;
  setPassword: (value: string) => void;
  confirmPassword: string;
  setConfirmPassword: (value: string) => void;
  onBack: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const PasswordStep: React.FC<PasswordStepProps> = ({
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  onBack,
  onSubmit,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {/* Password */}
      <div className="space-y-1.5">
        <label
          htmlFor="reg-password"
          className="flex items-center gap-2 font-gothic text-xs font-bold uppercase tracking-wider text-slate-dark"
        >
          <Lock className="w-3.5 h-3.5 text-cloud-dark" />
          <span>Password <span className="text-clay">*</span></span>
        </label>
        <Input
          id="reg-password"
          type="password"
          placeholder="Minimum 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoFocus
          autoComplete="new-password"
          className="min-h-[46px]"
        />
        <PasswordStrengthMeter password={password} />
      </div>

      {/* Confirm Password */}
      <div className="space-y-1.5">
        <label
          htmlFor="reg-confirm-password"
          className="flex items-center gap-2 font-gothic text-xs font-bold uppercase tracking-wider text-slate-dark"
        >
          <Lock className="w-3.5 h-3.5 text-cloud-dark" />
          <span>Confirm Password <span className="text-clay">*</span></span>
        </label>
        <Input
          id="reg-confirm-password"
          type="password"
          placeholder="Re-enter your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          autoComplete="new-password"
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
          disabled={!password || password !== confirmPassword}
          className="font-gothic uppercase tracking-wider text-xs"
        >
          Continue
        </Button>
      </div>
    </form>
  );
};
