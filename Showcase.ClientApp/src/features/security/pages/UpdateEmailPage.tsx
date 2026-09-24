import { CheckCircle2, Eye, EyeOff, Mail } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../../shared/api/apiClient.ts";
import { Button } from "../../../shared/components/Button.tsx";
import { Input } from "../../../shared/components/Input.tsx";
import { useAuth, useToast } from "../../../shared/context/index.ts";
import type { ProblemDetails } from "../../../shared/types/index.ts";
import { ProblemAlert } from "../components/ProblemAlert.tsx";
import { SecurityActionLayout } from "../components/SecurityActionLayout.tsx";

export const UpdateEmailPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, refreshUser } = useAuth();
  const { showToast } = useToast();

  const [currentEmail, setCurrentEmail] = useState(currentUser?.email || "");
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const trimmedEmail = newEmail.trim().toLowerCase();

    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      setProblem({
        title: "Invalid Email Address",
        detail: "Please provide a valid, well-formed email address.",
        status: 400,
      });
      return;
    }

    if (trimmedEmail === currentEmail.trim().toLowerCase()) {
      setProblem({
        title: "Unchanged Email",
        detail: "The new email address matches your current registered address.",
        status: 400,
      });
      return;
    }

    if (!currentPassword) {
      setProblem({
        title: "Authorization Required",
        detail: "Your existing account password is required to authorize email changes.",
        status: 400,
      });
      return;
    }

    setIsLoading(true);

    try {
      await apiClient.changeEmail({
        newEmail: trimmedEmail,
        currentPassword,
      });

      await refreshUser();
      showToast("success", `Email address successfully updated to ${trimmedEmail}.`);
      navigate("/settings/security");
    } catch (err: unknown) {
      const p = err as ProblemDetails;
      setProblem({
        title: p?.title || "Email Update Failed",
        detail: p?.detail || "An unexpected error occurred while modifying your email.",
        status: p?.status || 400,
        errors: p?.errors,
      });
      showToast("error", p?.detail || "Failed to update email address.");
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
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Current Email Info Box */}
        <div className="p-4 rounded-xl bg-[#f0eee6] border border-[#cccbc8]/60 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Mail className="h-5 w-5 text-[#87867f] shrink-0" />
            <div className="min-w-0">
              <span className="font-gothic text-[11px] font-bold uppercase tracking-wider text-[#87867f] block">
                Current Registered Address
              </span>
              <p className="font-serif text-sm font-semibold text-[#141413] truncate">
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
          onChange={(e) => setNewEmail(e.target.value)}
          placeholder="your.new.email@domain.com"
          required
          disabled={isLoading}
        />

        {/* Current Password Authorization */}
        <Input
          label="Authorize With Current Password"
          type={showPassword ? "text" : "password"}
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder="Enter current password"
          required
          disabled={isLoading}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="hover:text-[#141413] transition-colors p-1"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
        />

        {/* Problem Alert */}
        <ProblemAlert problem={problem} />

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
