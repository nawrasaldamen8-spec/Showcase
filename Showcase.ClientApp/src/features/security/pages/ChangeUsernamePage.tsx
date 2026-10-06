import { AtSign, Lock } from "lucide-react";
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
import { useAuth } from "@shared/context/index.ts";
import type { ProblemDetails } from "@shared/types/index.ts";
import { ProblemAlert } from "../components/ProblemAlert.tsx";
import { SecurityActionLayout } from "../components/SecurityActionLayout.tsx";

export const ChangeUsernamePage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, refreshUser } = useAuth();

  const [newUsername, setNewUsername] = useState(currentUser?.username || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [problem, setProblem] = useState<ProblemDetails | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProblem(null);
    setFieldErrors({});

    const trimmed = newUsername.trim();
    const clientErrors: Record<string, string> = {};

    if (!trimmed) {
      clientErrors.newUsername = "Username cannot be empty.";
    } else if (!/^[a-zA-Z0-9_-]{3,30}$/.test(trimmed)) {
      clientErrors.newUsername =
        "Username must be 3-30 characters long and contain only letters, numbers, underscores, or hyphens.";
    }

    if (!currentPassword) {
      clientErrors.currentPassword = "Current password is required to change username.";
    }

    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      return;
    }

    setIsLoading(true);

    try {
      await apiClient.changeUsername({
        currentPassword,
        newUsername: trimmed,
      });

      await refreshUser();
      toast.success("Username updated successfully.");
      navigate("/settings/security");
    } catch (err: unknown) {
      const extractedFields = extractApiFieldErrors(err);
      const problemDetails = extractApiProblemDetails(err);
      setFieldErrors(extractedFields);
      setProblem(problemDetails);
      const errorMsg = extractApiErrorMessage(err, "An error occurred while updating your username.");
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SecurityActionLayout
      title="Change Username"
      subtitle="Update your unique handle across Pority. Your public profile link will update automatically."
      badge="Account Handle"
      backTo="/settings/security"
      backLabel="Back to Account Security"
    >
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {problem && !Object.keys(fieldErrors).length && <ProblemAlert problem={problem} />}

        <div className="space-y-4">
          <Input
            id="current-username"
            label="Current Username"
            type="text"
            value={currentUser?.username ? `@${currentUser.username}` : "Not loaded"}
            disabled
            className="bg-[#e8e5dc]/50 text-cloud-dark cursor-not-allowed"
          />

          <Input
            id="new-username"
            label="New Username"
            type="text"
            placeholder="e.g. Tariq_Dev"
            value={newUsername}
            onChange={(e) => {
              setNewUsername(e.target.value);
              if (fieldErrors.newUsername || fieldErrors.NewUsername) {
                setFieldErrors((prev) => ({ ...prev, newUsername: "", NewUsername: "" }));
              }
            }}
            required
            autoComplete="username"
            disabled={isLoading}
            errorMessage={fieldErrors.newUsername || fieldErrors.NewUsername}
            leftIcon={<AtSign className="h-4 w-4 text-cloud-dark" />}
            helperText="3 to 30 characters: letters, numbers, underscores, hyphens"
          />

          <Input
            id="current-password"
            label="Current Password"
            type="password"
            placeholder="Enter your current password to authorize"
            value={currentPassword}
            onChange={(e) => {
              setCurrentPassword(e.target.value);
              if (fieldErrors.currentPassword || fieldErrors.CurrentPassword) {
                setFieldErrors((prev) => ({ ...prev, currentPassword: "", CurrentPassword: "" }));
              }
            }}
            required
            autoComplete="current-password"
            disabled={isLoading}
            errorMessage={fieldErrors.currentPassword || fieldErrors.CurrentPassword}
            leftIcon={<Lock className="h-4 w-4 text-cloud-dark" />}
            helperText="Required to verify your identity"
          />
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <Button
            type="submit"
            variant="clay"
            size="lg"
            isLoading={isLoading}
            disabled={isLoading || !newUsername.trim() || !currentPassword}
            className="w-full sm:w-auto"
          >
            Save Username
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => navigate("/settings/security")}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
        </div>
      </form>
    </SecurityActionLayout>
  );
};
