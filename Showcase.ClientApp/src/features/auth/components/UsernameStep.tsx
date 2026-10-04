import React from "react";
import { ArrowRight, AtSign, CheckCircle2, Loader2, XCircle } from "lucide-react";
import { Button } from "@shared/components/Button.tsx";
import { Input } from "@shared/components/Input.tsx";
import { GoogleAuthButton } from "./GoogleAuthButton.tsx";

export interface UsernameStepProps {
  username: string;
  setUsername: (value: string) => void;
  usernameStatus: "idle" | "checking" | "available" | "taken";
  onSubmit: (e: React.FormEvent) => void;
  showGoogleOption?: boolean;
}

export const UsernameStep: React.FC<UsernameStepProps> = ({
  username,
  setUsername,
  usernameStatus,
  onSubmit,
  showGoogleOption = true,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="reg-username"
            className="flex items-center gap-2 font-gothic text-xs font-bold uppercase tracking-wider text-slate-dark"
          >
            <AtSign className="w-3.5 h-3.5 text-cloud-dark" />
            <span>Username Handle <span className="text-clay">*</span></span>
          </label>
          {usernameStatus === "checking" && (
            <span className="inline-flex items-center gap-1 font-serif text-[11px] text-cloud-dark">
              <Loader2 className="w-3 h-3 animate-spin" /> Checking...
            </span>
          )}
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
          autoFocus
          autoComplete="username"
          enterKeyHint="next"
        />
        <p className="font-serif text-[11px] text-cloud-dark">
          Your permanent portfolio link: pority.design/u/{username || "handle"}
        </p>
      </div>

      <div className="pt-2">
        <Button
          type="submit"
          variant="clay"
          size="lg"
          fullWidth
          rightIcon={<ArrowRight className="w-4 h-4" />}
          disabled={!username.trim() || usernameStatus === "taken" || usernameStatus === "checking"}
          className="font-gothic uppercase tracking-wider text-xs justify-center"
        >
          Continue
        </Button>
      </div>

      {showGoogleOption && (
        <>
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-stone/60" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-ivory-light px-2 text-cloud-dark font-gothic tracking-wider text-[10px]">
                Or sign up with Google
              </span>
            </div>
          </div>

          <GoogleAuthButton
            onClick={() => {
              window.location.href = "/api/auth/google";
            }}
            text="Continue with Google"
          />
        </>
      )}
    </form>
  );
};
