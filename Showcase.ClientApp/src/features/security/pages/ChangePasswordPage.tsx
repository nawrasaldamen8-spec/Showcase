import { Eye, EyeOff, Lock } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "@shared/api/apiClient.ts";
import { Button } from "@shared/components/Button.tsx";
import { Input } from "@shared/components/Input.tsx";
import { useToast } from "@shared/context/index.ts";
import type { ProblemDetails } from "@shared/types/index.ts";
import { ProblemAlert } from "../components/ProblemAlert.tsx";
import { SecurityActionLayout } from "../components/SecurityActionLayout.tsx";

export const ChangePasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [problem, setProblem] = useState<ProblemDetails | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProblem(null);

    if (!currentPassword) {
      setProblem({
        title: "Validation Error",
        detail: "Current password is required to authorize this credential change.",
        status: 400,
      });
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setProblem({
        title: "Validation Error",
        detail: "New password must contain at least 6 characters.",
        status: 400,
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setProblem({
        title: "Validation Error",
        detail: "New password and confirmation do not match.",
        status: 400,
      });
      return;
    }

    setIsLoading(true);

    try {
      await apiClient.changePassword({
        currentPassword,
        newPassword,
      });

      showToast("success", "Your password has been successfully updated.");
      navigate("/settings/security");
    } catch (err: unknown) {
      const p = err as ProblemDetails;
      setProblem({
        title: p?.title || "Password Update Failed",
        detail: p?.detail || "An unexpected error occurred while modifying your passphrase.",
        status: p?.status || 400,
        errors: p?.errors,
      });
      showToast("error", p?.detail || "Failed to update password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SecurityActionLayout
      title="Change Password"
      subtitle="Ensure your creator atelier uses a secure passphrase of at least 6 characters."
      badge="Credentials"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Current Password"
          type={showCurrentPassword ? "text" : "password"}
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder="Enter current password"
          required
          disabled={isLoading}
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

        <div className="space-y-4 pt-1">
          <Input
            label="New Password"
            type={showNewPassword ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Minimum 6 characters"
            required
            disabled={isLoading}
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
            disabled={isLoading}
          />
        </div>

        {/* Problem Alert */}
        <ProblemAlert problem={problem} />

        {/* Action Button: Full-width at the bottom */}
        <div className="pt-3">
          <Button
            type="submit"
            variant="clay"
            size="lg"
            fullWidth
            isLoading={isLoading}
            disabled={!currentPassword || !newPassword || !confirmPassword}
            leftIcon={<Lock className="h-4 w-4" />}
            className="justify-center font-gothic uppercase tracking-wider text-xs shadow-none"
          >
            Update Password
          </Button>
        </div>
      </form>
    </SecurityActionLayout>
  );
};
