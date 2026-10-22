import React from "react";
import { ArrowLeft, ArrowRight, AtSign, CheckCircle2, Loader2, XCircle } from "lucide-react";
import { Button } from "@shared/components/Button.tsx";
import { Input } from "@shared/components/Input.tsx";

export interface UsernameStepProps {
  username: string;
  setUsername: (value: string) => void;
  usernameStatus: "idle" | "checking" | "available" | "taken";
  onSubmit: (e: React.FormEvent) => void;
  onBack?: () => void;
}

export const UsernameStep: React.FC<UsernameStepProps> = ({
  username,
  setUsername,
  usernameStatus,
  onSubmit,
  onBack,
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
          className="min-h-[46px]"
        />
        <p className="font-serif text-[11px] text-cloud-dark">
          Permanent portfolio link: pority.design/u/{username || "handle"}
        </p>
      </div>

      <div className="pt-2 flex items-center justify-between gap-3">
        {onBack ? (
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onBack}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            className="font-gothic uppercase tracking-wider text-xs justify-center"
          >
            Back
          </Button>
        ) : (
          <div />
        )}
        <Button
          type="submit"
          variant="clay"
          size="md"
          rightIcon={<ArrowRight className="w-4 h-4" />}
          disabled={!username.trim() || usernameStatus === "taken" || usernameStatus === "checking"}
          className="font-gothic uppercase tracking-wider text-xs justify-center ml-auto"
        >
          Continue
        </Button>
      </div>
    </form>
  );
};
