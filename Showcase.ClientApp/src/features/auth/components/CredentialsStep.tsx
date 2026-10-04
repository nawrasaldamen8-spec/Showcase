import React from "react";
import {
  ArrowRight,
  AtSign,
  CheckCircle2,
  Lock,
  Mail,
  XCircle,
} from "lucide-react";
import { Button } from "@shared/components/Button.tsx";
import { Input } from "@shared/components/Input.tsx";
import { PasswordStrengthMeter } from "./PasswordStrengthMeter.tsx";
import { GoogleAuthButton } from "./GoogleAuthButton.tsx";

export interface CredentialsStepProps {
  email: string;
  setEmail: (value: string) => void;
  username: string;
  setUsername: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  confirmPassword: string;
  setConfirmPassword: (value: string) => void;
  usernameStatus: "idle" | "checking" | "available" | "taken";
  onSubmit: (e: React.FormEvent) => void;
}

export const CredentialsStep: React.FC<CredentialsStepProps> = ({
  email,
  setEmail,
  username,
  setUsername,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  usernameStatus,
  onSubmit,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {/* Email Address */}
      <div className="space-y-1.5">
        <label
          htmlFor="reg-email"
          className="flex items-center gap-2 font-gothic text-xs font-bold uppercase tracking-wider text-slate-dark"
        >
          <Mail className="w-3.5 h-3.5 text-cloud-dark" />
          <span>Email Address <span className="text-clay">*</span></span>
        </label>
        <Input
          id="reg-email"
          type="email"
          placeholder="e.g. elena@studio-vance.design"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoFocus
          autoComplete="email"
          enterKeyHint="next"
        />
      </div>

      {/* Username */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="reg-username"
            className="flex items-center gap-2 font-gothic text-xs font-bold uppercase tracking-wider text-slate-dark"
          >
            <AtSign className="w-3.5 h-3.5 text-cloud-dark" />
            <span>Username Handle <span className="text-clay">*</span></span>
          </label>
          {usernameStatus === "available" && (
            <span className="inline-flex items-center gap-1 font-serif text-[11px] text-[#2e7d32]">
              <CheckCircle2 className="w-3.5 h-3.5" /> Available
            </span>
          )}
          {usernameStatus === "taken" && (
            <span className="inline-flex items-center gap-1 font-serif text-[11px] text-red-600">
              <XCircle className="w-3.5 h-3.5" /> Already taken
            </span>
          )}
        </div>
        <Input
          id="reg-username"
          type="text"
          placeholder="e.g. arch_vance"
          value={username}
          onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
          required
          autoComplete="username"
          enterKeyHint="next"
        />
      </div>

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
          placeholder="Re-enter password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </div>

      <div className="pt-3">
        <Button
          type="submit"
          variant="clay"
          size="lg"
          fullWidth
          rightIcon={<ArrowRight className="w-4 h-4" />}
          className="font-gothic uppercase tracking-wider text-xs justify-center"
        >
          Next: Personal Information
        </Button>
      </div>

      <div className="relative my-4 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-stone/50" />
        </div>
        <span className="relative bg-ivory-light px-3 font-gothic text-[10px] font-bold uppercase tracking-wider text-cloud-dark">
          Or register instantly with
        </span>
      </div>

      <GoogleAuthButton onClick={() => { window.location.href = "/api/auth/google"; }} text="Continue with Google" />
    </form>
  );
};
