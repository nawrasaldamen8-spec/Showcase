import { AtSign, CheckCircle2, Eye, EyeOff } from "lucide-react";
import React, { useState } from "react";
import { apiClient } from "@shared/api/apiClient.ts";
import { Button } from "@shared/components/Button.tsx";
import { Input } from "@shared/components/Input.tsx";
import { useAuth } from "@shared/context/useAuth.ts";
import type { ProblemDetails } from "@shared/types/index.ts";
import { ProblemAlert } from "../../security/components/ProblemAlert.tsx";

export interface UsernameSecuritySectionProps {
  currentUsername?: string;
  onUsernameChanged?: (newUsername: string) => void;
  onNotify?: (message: string, type?: "success" | "error") => void;
}

export const UsernameSecuritySection: React.FC<UsernameSecuritySectionProps> = ({
  currentUsername = "",
  onUsernameChanged,
  onNotify,
}) => {
  const { refreshUser } = useAuth();
  const [newUsername, setNewUsername] = useState("");
  const [usernameCurrentPassword, setUsernameCurrentPassword] = useState("");
  const [showUsernamePassword, setShowUsernamePassword] = useState(false);
  const [isUpdatingUsername, setIsUpdatingUsername] = useState(false);
  const [usernameProblem, setUsernameProblem] = useState<ProblemDetails | null>(null);
  const [usernameSuccess, setUsernameSuccess] = useState<string | null>(null);

  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUsernameProblem(null);
    setUsernameSuccess(null);

    const trimmedUsername = newUsername.trim();
    const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;

    if (!usernameRegex.test(trimmedUsername)) {
      setUsernameProblem({
        title: "Invalid Username Slug",
        detail:
          "Username must be between 3 and 30 characters and contain only alphanumeric letters, digits, underscores, or hyphens.",
        status: 400,
      });
      return;
    }

    if (trimmedUsername.toLowerCase() === currentUsername.trim().toLowerCase()) {
      setUsernameProblem({
        title: "Unchanged Username",
        detail: "The specified username is already assigned to your creator profile.",
        status: 400,
      });
      return;
    }

    if (!usernameCurrentPassword) {
      setUsernameProblem({
        title: "Verification Required",
        detail: "Current password is required to authorize username alteration.",
        status: 400,
      });
      return;
    }

    setIsUpdatingUsername(true);
    try {
      await apiClient.changeUsername({
        newUsername: trimmedUsername,
        currentPassword: usernameCurrentPassword,
      });

      await refreshUser();
      onUsernameChanged?.(trimmedUsername);
      setUsernameSuccess(`Creator username updated to @${trimmedUsername}`);
      onNotify?.("Username successfully updated.", "success");
      setNewUsername("");
      setUsernameCurrentPassword("");
      setTimeout(() => setUsernameSuccess(null), 5000);
    } catch (err: unknown) {
      const p = err as ProblemDetails;
      const problem: ProblemDetails = {
        title: p?.title || "Username Change Failed",
        detail: p?.detail || (err as { message?: string })?.message || "Username update failed.",
        status: p?.status || 400,
        errors: p?.errors,
      };
      setUsernameProblem(problem);
      onNotify?.(problem.detail || "Username update failed.", "error");
    } finally {
      setIsUpdatingUsername(false);
    }
  };

  return (
    <section aria-labelledby="change-username-heading" className="space-y-4">
      <div className="flex items-center gap-2">
        <AtSign className="h-4 w-4 text-[#87867f]" />
        <h3
          id="change-username-heading"
          className="font-gothic text-xs sm:text-sm font-bold uppercase tracking-[0.12em] text-[#141413]"
        >
          Change Username Slug
        </h3>
      </div>

      <div className="flex items-center gap-2 font-serif text-xs sm:text-sm text-[#87867f]">
        <span>Current Public Handle:</span>
        <span className="font-gothic text-xs font-semibold text-[#141413] bg-[#f0eee6] px-2 py-0.5 rounded">
          @{currentUsername || "elena_v"}
        </span>
        <span className="text-xs text-[#87867f]/80">(Target URL: /u/{currentUsername || "elena_v"})</span>
      </div>

      <form onSubmit={handleUsernameSubmit} className="space-y-4 max-w-xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="New Username"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            placeholder="e.g. elena_vance"
            helperText="3-30 chars. Letters, digits, underscores, hyphens."
            required
            disabled={isUpdatingUsername}
          />

          <Input
            label="Current Password"
            type={showUsernamePassword ? "text" : "password"}
            value={usernameCurrentPassword}
            onChange={(e) => setUsernameCurrentPassword(e.target.value)}
            placeholder="Confirm password"
            required
            disabled={isUpdatingUsername}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowUsernamePassword((prev) => !prev)}
                className="hover:text-[#141413] transition-colors p-1"
                aria-label={showUsernamePassword ? "Hide password" : "Show password"}
              >
                {showUsernamePassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
          />
        </div>

        <ProblemAlert problem={usernameProblem} />

        {usernameSuccess && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-[#2e7d32]/10 border border-[#2e7d32]/30 text-[#2e7d32] text-xs font-serif animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{usernameSuccess}</span>
          </div>
        )}

        <div className="pt-1">
          <Button
            type="submit"
            variant="slate"
            size="sm"
            isLoading={isUpdatingUsername}
            disabled={!newUsername || !usernameCurrentPassword}
          >
            Update Username Slug
          </Button>
        </div>
      </form>
    </section>
  );
};
