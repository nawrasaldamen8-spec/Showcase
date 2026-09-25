import { CheckCircle2, Eye, EyeOff, Mail } from "lucide-react";
import React, { useState } from "react";
import { apiClient } from "@shared/api/apiClient.ts";
import { Button } from "@shared/components/Button.tsx";
import { Input } from "@shared/components/Input.tsx";
import { useAuth } from "@shared/context/useAuth.ts";
import type { ProblemDetails } from "@shared/types/index.ts";
import { ProblemAlert } from "../../security/components/ProblemAlert.tsx";

export interface EmailSecuritySectionProps {
  currentEmail?: string;
  onEmailChanged?: (newEmail: string) => void;
  onNotify?: (message: string, type?: "success" | "error") => void;
}

export const EmailSecuritySection: React.FC<EmailSecuritySectionProps> = ({
  currentEmail = "",
  onEmailChanged,
  onNotify,
}) => {
  const { refreshUser } = useAuth();
  const [newEmail, setNewEmail] = useState("");
  const [emailCurrentPassword, setEmailCurrentPassword] = useState("");
  const [showEmailPassword, setShowEmailPassword] = useState(false);
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [emailProblem, setEmailProblem] = useState<ProblemDetails | null>(null);
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailProblem(null);
    setEmailSuccess(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const trimmedEmail = newEmail.trim().toLowerCase();

    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      setEmailProblem({
        title: "Invalid Email Address",
        detail: "Please provide a valid, well-formed email address.",
        status: 400,
      });
      return;
    }

    if (trimmedEmail === currentEmail.trim().toLowerCase()) {
      setEmailProblem({
        title: "Unchanged Email",
        detail: "The new email address matches your current registered email.",
        status: 400,
      });
      return;
    }

    if (!emailCurrentPassword) {
      setEmailProblem({
        title: "Verification Required",
        detail: "Current password is required to authorize email alteration.",
        status: 400,
      });
      return;
    }

    setIsUpdatingEmail(true);
    try {
      await apiClient.changeEmail({
        newEmail: trimmedEmail,
        currentPassword: emailCurrentPassword,
      });

      await refreshUser();
      onEmailChanged?.(trimmedEmail);
      setEmailSuccess(`Account email updated to ${trimmedEmail}`);
      onNotify?.("Email address successfully updated.", "success");
      setNewEmail("");
      setEmailCurrentPassword("");
      setTimeout(() => setEmailSuccess(null), 5000);
    } catch (err: unknown) {
      const p = err as ProblemDetails;
      const problem: ProblemDetails = {
        title: p?.title || "Email Change Failed",
        detail: p?.detail || (err as { message?: string })?.message || "Email update failed.",
        status: p?.status || 400,
        errors: p?.errors,
      };
      setEmailProblem(problem);
      onNotify?.(problem.detail || "Email update failed.", "error");
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  return (
    <section aria-labelledby="change-email-heading" className="space-y-4">
      <div className="flex items-center gap-2">
        <Mail className="h-4 w-4 text-[#87867f]" />
        <h3
          id="change-email-heading"
          className="font-gothic text-xs sm:text-sm font-bold uppercase tracking-[0.12em] text-[#141413]"
        >
          Change Email Address
        </h3>
      </div>

      <div className="flex items-center gap-2 font-serif text-xs sm:text-sm text-[#87867f]">
        <span>Current Address:</span>
        <span className="font-gothic text-xs font-semibold text-[#141413] bg-[#f0eee6] px-2 py-0.5 rounded">
          {currentEmail || "elena.vance@showcase.gallery"}
        </span>
      </div>

      <form onSubmit={handleEmailSubmit} className="space-y-4 max-w-xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="New Email Address"
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="new.email@example.com"
            required
            disabled={isUpdatingEmail}
          />

          <Input
            label="Current Password"
            type={showEmailPassword ? "text" : "password"}
            value={emailCurrentPassword}
            onChange={(e) => setEmailCurrentPassword(e.target.value)}
            placeholder="Confirm password"
            required
            disabled={isUpdatingEmail}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowEmailPassword((prev) => !prev)}
                className="hover:text-[#141413] transition-colors p-1"
                aria-label={showEmailPassword ? "Hide password" : "Show password"}
              >
                {showEmailPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
          />
        </div>

        <ProblemAlert problem={emailProblem} />

        {emailSuccess && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-[#2e7d32]/10 border border-[#2e7d32]/30 text-[#2e7d32] text-xs font-serif animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{emailSuccess}</span>
          </div>
        )}

        <div className="pt-1">
          <Button
            type="submit"
            variant="slate"
            size="sm"
            isLoading={isUpdatingEmail}
            disabled={!newEmail || !emailCurrentPassword}
          >
            Update Email Address
          </Button>
        </div>
      </form>
    </section>
  );
};
