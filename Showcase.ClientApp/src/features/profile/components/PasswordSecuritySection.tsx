import { CheckCircle2, Eye, EyeOff, KeyRound } from "lucide-react";
import React, { useState } from "react";
import { apiClient } from "@shared/api/apiClient.ts";
import { Button } from "@shared/components/Button.tsx";
import { Input } from "@shared/components/Input.tsx";
import type { ProblemDetails } from "@shared/types/index.ts";
import { ProblemAlert } from "../../security/components/ProblemAlert.tsx";

export interface PasswordSecuritySectionProps {
  onNotify?: (message: string, type?: "success" | "error") => void;
}

export const PasswordSecuritySection: React.FC<PasswordSecuritySectionProps> = ({ onNotify }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordProblem, setPasswordProblem] = useState<ProblemDetails | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordProblem(null);
    setPasswordSuccess(null);

    if (!currentPassword) {
      setPasswordProblem({
        title: "Validation Error",
        detail: "Current password is required to authorize this credential change.",
        status: 400,
      });
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setPasswordProblem({
        title: "Validation Error",
        detail: "New password must contain at least 6 characters.",
        status: 400,
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordProblem({
        title: "Validation Error",
        detail: "New password and confirmation do not match.",
        status: 400,
      });
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await apiClient.changePassword({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordSuccess("Password successfully updated.");
      onNotify?.("Password successfully updated.", "success");
      setTimeout(() => setPasswordSuccess(null), 5000);
    } catch (err: unknown) {
      const p = err as ProblemDetails;
      const problem: ProblemDetails = {
        title: p?.title || "Password Change Failed",
        detail: p?.detail || (err as { message?: string })?.message || "Password update failed.",
        status: p?.status || 400,
        errors: p?.errors,
      };
      setPasswordProblem(problem);
      onNotify?.(problem.detail || "Password update failed.", "error");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <section aria-labelledby="change-password-heading" className="space-y-4">
      <div className="flex items-center gap-2">
        <KeyRound className="h-4 w-4 text-[#87867f]" />
        <h3
          id="change-password-heading"
          className="font-gothic text-xs sm:text-sm font-bold uppercase tracking-[0.12em] text-[#141413]"
        >
          Change Account Password
        </h3>
      </div>
      <p className="font-serif text-xs sm:text-sm text-[#87867f]">
        Ensure your account uses a secure passphrase of at least 6 characters.
      </p>

      <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-xl">
        <Input
          label="Current Password"
          type={showCurrentPassword ? "text" : "password"}
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder="Enter existing password"
          required
          disabled={isUpdatingPassword}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowCurrentPassword((prev) => !prev)}
              className="hover:text-[#141413] transition-colors p-1"
              aria-label={showCurrentPassword ? "Hide current password" : "Show current password"}
            >
              {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="New Password"
            type={showNewPassword ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Min. 6 characters"
            required
            disabled={isUpdatingPassword}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowNewPassword((prev) => !prev)}
                className="hover:text-[#141413] transition-colors p-1"
                aria-label={showNewPassword ? "Hide new password" : "Show new password"}
              >
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
          />

          <Input
            label="Confirm New Password"
            type={showNewPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter new password"
            required
            disabled={isUpdatingPassword}
          />
        </div>

        <ProblemAlert problem={passwordProblem} />

        {passwordSuccess && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-[#2e7d32]/10 border border-[#2e7d32]/30 text-[#2e7d32] text-xs font-serif animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{passwordSuccess}</span>
          </div>
        )}

        <div className="pt-1">
          <Button
            type="submit"
            variant="slate"
            size="sm"
            isLoading={isUpdatingPassword}
            disabled={!currentPassword || !newPassword || !confirmPassword}
          >
            Update Password
          </Button>
        </div>
      </form>
    </section>
  );
};
