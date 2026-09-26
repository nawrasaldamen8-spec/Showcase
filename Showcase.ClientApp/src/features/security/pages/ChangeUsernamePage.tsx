import { AtSign, Lock } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "@shared/api/apiClient.ts";
import { Button } from "@shared/components/Button.tsx";
import { Input } from "@shared/components/Input.tsx";
import { useAuth, useToast } from "@shared/context/index.ts";
import type { ProblemDetails } from "@shared/types/index.ts";
import { ProblemAlert } from "../components/ProblemAlert.tsx";
import { SecurityActionLayout } from "../components/SecurityActionLayout.tsx";

export const ChangeUsernamePage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [newUsername, setNewUsername] = useState(currentUser?.username || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [problem, setProblem] = useState<ProblemDetails | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProblem(null);

    const trimmed = newUsername.trim();
    const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;

    if (!trimmed) {
      setProblem({
        title: "Validation Error",
        detail: "Username cannot be empty.",
        status: 400,
      });
      return;
    }

    if (!usernameRegex.test(trimmed)) {
      setProblem({
        title: "Validation Error",
        detail: "Username must be 3-30 characters long and contain only letters, numbers, underscores, or hyphens.",
        status: 400,
      });
      return;
    }

    if (!currentPassword) {
      setProblem({
        title: "Validation Error",
        detail: "Current password is required to change username.",
        status: 400,
      });
      return;
    }

    setIsLoading(true);

    try {
      await apiClient.changeUsername({
        currentPassword,
        newUsername: trimmed,
      });

      showToast("success", "Username updated successfully.");
      navigate("/settings/security");
    } catch (err: unknown) {
      const p = err as ProblemDetails;
      setProblem({
        title: p?.title || "Update Failed",
        detail: p?.detail || "An error occurred while updating your username.",
        status: p?.status || 400,
      });
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
        <ProblemAlert problem={problem} />

        <div className="space-y-4">
          <Input
            id="current-username"
            label="Current Username"
            type="text"
            value={currentUser?.username ? `@${currentUser.username}` : "Not loaded"}
            disabled
            className="bg-[#e8e5dc]/50 text-[#87867f] cursor-not-allowed"
          />

          <Input
            id="new-username"
            label="New Username"
            type="text"
            placeholder="e.g. Tariq_Dev"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            required
            autoComplete="username"
            leftIcon={<AtSign className="h-4 w-4 text-[#87867f]" />}
            helperText="3 to 30 characters: letters, numbers, underscores, hyphens"
          />

          <Input
            id="current-password"
            label="Current Password"
            type="password"
            placeholder="Enter your current password to authorize"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            autoComplete="current-password"
            leftIcon={<Lock className="h-4 w-4 text-[#87867f]" />}
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
