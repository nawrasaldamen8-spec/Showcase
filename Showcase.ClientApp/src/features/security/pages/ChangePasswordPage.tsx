import { Eye, EyeOff, Lock } from "lucide-react";
import React, { useState } from "react";
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
import type { ProblemDetails } from "@shared/types/index.ts";
import { ProblemAlert } from "../components/ProblemAlert.tsx";
import { SecurityActionLayout } from "../components/SecurityActionLayout.tsx";

export const ChangePasswordPage: React.FC = () => {
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [problem, setProblem] = useState<ProblemDetails | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProblem(null);
    setFieldErrors({});

    const clientErrors: Record<string, string> = {};
    if (!currentPassword) {
      clientErrors.currentPassword = "Current password is required.";
    }
    if (!newPassword || newPassword.length < 6) {
      clientErrors.newPassword = "New password must contain at least 6 characters.";
    }
    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      clientErrors.confirmPassword = "Passwords do not match.";
    }

    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      return;
    }

    setIsLoading(true);

    try {
      await apiClient.changePassword({
        currentPassword,
        newPassword,
      });

      toast.success("Password updated successfully.");
      navigate("/settings/security");
    } catch (err: unknown) {
      const extractedFields = extractApiFieldErrors(err);
      const problemDetails = extractApiProblemDetails(err);
      setFieldErrors(extractedFields);
      setProblem(problemDetails);
      const errorMsg = extractApiErrorMessage(err, "Failed to update password.");
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SecurityActionLayout
      title="Change Password"
      subtitle="Choose a strong password with at least 6 characters."
      badge="Credentials"
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <Input
          label="Current Password"
          type={showCurrentPassword ? "text" : "password"}
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
              onClick={() => setShowCurrentPassword((prev) => !prev)}
              className="hover:text-slate-dark transition-colors p-1"
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
            onChange={(e) => {
              setNewPassword(e.target.value);
              if (fieldErrors.newPassword || fieldErrors.NewPassword) {
                setFieldErrors((prev) => ({ ...prev, newPassword: "", NewPassword: "" }));
              }
            }}
            placeholder="Minimum 6 characters"
            required
            disabled={isLoading}
            errorMessage={fieldErrors.newPassword || fieldErrors.NewPassword}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowNewPassword((prev) => !prev)}
                className="hover:text-slate-dark transition-colors p-1"
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
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (fieldErrors.confirmPassword || fieldErrors.ConfirmPassword) {
                setFieldErrors((prev) => ({ ...prev, confirmPassword: "", ConfirmPassword: "" }));
              }
            }}
            placeholder="Re-enter new password"
            required
            disabled={isLoading}
            errorMessage={fieldErrors.confirmPassword || fieldErrors.ConfirmPassword}
          />
        </div>

        {/* Global / Unmapped Problem Alert */}
        {problem && !Object.keys(fieldErrors).length && <ProblemAlert problem={problem} />}

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
