import { CheckCircle2, Eye, EyeOff, Mail } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  apiClient,
  extractApiErrorMessage,
  extractApiFieldErrors,
  extractApiProblemDetails,
} from "@shared/api/index.ts";
import { Button } from "@shared/components/Button.tsx";
import { Input } from "@shared/components/Input.tsx";
import { useAuth } from "@shared/context/index.ts";
import type { ProblemDetails } from "@shared/types/index.ts";
import { ProblemAlert } from "../components/ProblemAlert.tsx";
import { SecurityActionLayout } from "../components/SecurityActionLayout.tsx";

export const UpdateEmailPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, refreshUser } = useAuth();

  const [currentEmail, setCurrentEmail] = useState(currentUser?.email || "");
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [problem, setProblem] = useState<ProblemDetails | null>(null);

  useEffect(() => {
    if (!currentUser?.email) {
      let isMounted = true;
      void apiClient.getMyProfile().then((p) => {
        if (isMounted && p?.email) {
          setCurrentEmail(p.email);
        }
      });
      return () => {
        isMounted = false;
      };
    }
  }, [currentUser?.email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProblem(null);
    setFieldErrors({});

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const trimmedEmail = newEmail.trim().toLowerCase();
    const clientErrors: Record<string, string> = {};

    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      clientErrors.newEmail = "Please provide a valid, well-formed email address.";
    } else if (trimmedEmail === currentEmail.trim().toLowerCase()) {
      clientErrors.newEmail = "The new email address matches your current registered address.";
    }

    if (!currentPassword) {
      clientErrors.currentPassword = "Your existing account password is required to authorize email changes.";
    }

    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      return;
    }

    setIsLoading(true);

    try {
      await apiClient.changeEmail({
        newEmail: trimmedEmail,
        currentPassword,
      });

      await refreshUser();
      toast.success(`Email address successfully updated to ${trimmedEmail}.`);
      navigate("/settings/security");
    } catch (err: unknown) {
      const extractedFields = extractApiFieldErrors(err);
      const problemDetails = extractApiProblemDetails(err);
      setFieldErrors(extractedFields);
      setProblem(problemDetails);
      const errorMsg = extractApiErrorMessage(err, "Failed to update email address.");
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SecurityActionLayout
      title="Update Email Address"
      subtitle="Your email address is used for critical security notifications and account recovery."
      badge="Credentials"
    >
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {/* Current Email Info Box */}
        <div className="p-4 rounded-xl bg-ivory-medium border border-stone/60 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Mail className="h-5 w-5 text-cloud-dark shrink-0" />
            <div className="min-w-0">
              <span className="font-gothic text-[11px] font-bold uppercase tracking-wider text-cloud-dark block">
                Current Registered Address
              </span>
              <p className="font-serif text-sm font-semibold text-slate-dark truncate">
                {currentEmail || currentUser?.email || "Loading current address..."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 px-2.5 py-1 rounded-full bg-[#2e7d32]/10 border border-[#2e7d32]/30 text-[#2e7d32]">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span className="font-gothic text-[10px] font-bold uppercase tracking-wider">Verified</span>
          </div>
        </div>

        {/* New Email Input */}
        <Input
          label="New Email Address"
          type="email"
          value={newEmail}
          onChange={(e) => {
            setNewEmail(e.target.value);
            if (fieldErrors.newEmail || fieldErrors.NewEmail) {
              setFieldErrors((prev) => ({ ...prev, newEmail: "", NewEmail: "" }));
            }
          }}
          placeholder="your.new.email@domain.com"
          required
          disabled={isLoading}
          errorMessage={fieldErrors.newEmail || fieldErrors.NewEmail}
        />

        {/* Current Password Authorization */}
        <Input
          label="Authorize With Current Password"
          type={showPassword ? "text" : "password"}
          value={currentPassword}
          onChange={(e) => {
            setCurrentPassword(e.target.value);
            if (fieldErrors.currentPassword || fieldErrors.CurrentPassword) {
              setFieldErrors((prev) => ({ ...prev, currentPassword: "", CurrentPassword: "" }));
            }
          }}
          placeholder="Enter current password"
          required
          disabled={isLoading}
          errorMessage={fieldErrors.currentPassword || fieldErrors.CurrentPassword}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="hover:text-slate-dark transition-colors p-1"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
        />

        {/* Problem Alert */}
        {problem && !Object.keys(fieldErrors).length && <ProblemAlert problem={problem} />}

        {/* Action Button: Full-width at the bottom */}
        <div className="pt-2">
          <Button
            type="submit"
            variant="clay"
            size="lg"
            fullWidth
            isLoading={isLoading}
            disabled={!newEmail || !currentPassword}
            leftIcon={<Mail className="h-4 w-4" />}
            className="justify-center font-gothic uppercase tracking-wider text-xs shadow-none"
          >
            Confirm Email Change
          </Button>
        </div>
      </form>
    </SecurityActionLayout>
  );
};
