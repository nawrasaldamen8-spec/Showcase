import { Clock, MessageSquare } from "lucide-react";
import React, { useState } from "react";
import { apiClient } from "@shared/api/apiClient.ts";
import { Button } from "@shared/components/Button.tsx";
import { Textarea } from "@shared/components/Textarea.tsx";
import { useAsyncData } from "@shared/hooks/index.ts";
import { useAuth, useToast } from "@shared/context/index.ts";
import type { ProblemDetails } from "@shared/types/index.ts";
import { ProblemAlert } from "./ProblemAlert.tsx";
import { SecurityActionLayout } from "./SecurityActionLayout.tsx";

export interface StatusRequestPageConfig {
  title: string;
  subtitle: string;
  badge: string;
  statusField: "verificationStatus" | "featuredStatus";
  approvedStatusValue: string;
  submitFn: (message: string) => Promise<void>;
  successMessage: string;
  approvedTitle: string;
  approvedDescription: string;
  approvedFooter: string;
  approvedRenderIcon: () => React.ReactNode;
  pendingTitle: string;
  pendingDescription: string;
  formLabel: string;
  formPlaceholder: string;
  formHelperText: string;
  buttonLabel: string;
}

export const StatusRequestPage: React.FC<StatusRequestPageConfig> = ({
  title,
  subtitle,
  badge,
  statusField,
  approvedStatusValue,
  submitFn,
  successMessage,
  approvedTitle,
  approvedDescription,
  approvedFooter,
  approvedRenderIcon,
  pendingTitle,
  pendingDescription,
  formLabel,
  formPlaceholder,
  formHelperText,
  buttonLabel,
}) => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const { data: profile, reload: loadData } = useAsyncData(() => apiClient.getMyProfile());

  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [problem, setProblem] = useState<ProblemDetails | null>(null);

  const status =
    (profile?.[statusField] as string) ||
    (currentUser?.[statusField] as string) ||
    (statusField === "verificationStatus" && (profile?.isVerified || currentUser?.isVerified)
      ? "verified"
      : "none");

  const isApproved =
    status === approvedStatusValue ||
    (statusField === "verificationStatus" && Boolean(profile?.isVerified || currentUser?.isVerified));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProblem(null);

    const trimmed = message.trim();
    if (!trimmed) {
      setProblem({
        title: "Validation Error",
        detail: `Please provide a message for your ${title.toLowerCase()}.`,
        status: 400,
      });
      return;
    }

    setIsLoading(true);

    try {
      await submitFn(trimmed);
      showToast("success", successMessage);
      loadData();
      setMessage("");
    } catch (err: unknown) {
      const p = err as ProblemDetails;
      setProblem({
        title: p?.title || "Submission Failed",
        detail: p?.detail || "An error occurred while submitting your request.",
        status: p?.status || 400,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SecurityActionLayout
      title={title}
      subtitle={subtitle}
      badge={badge}
      backTo="/settings/security"
      backLabel="Back to Account Security"
    >
      {/* 1. Status Banner */}
      {isApproved ? (
        <div className="bg-[#2e7d32]/10 border border-[#2e7d32]/30 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-3">
            {approvedRenderIcon()}
            <div>
              <h3 className="font-gothic text-base font-bold uppercase tracking-tight text-[#2e7d32]">
                {approvedTitle}
              </h3>
              <p className="font-serif text-xs text-[#2e7d32]/90 mt-0.5">
                {approvedDescription}
              </p>
            </div>
          </div>
          <div className="pt-2 border-t border-[#2e7d32]/20 text-xs font-serif text-slate-dark/70">
            {approvedFooter}
          </div>
        </div>
      ) : status === "pending" ? (
        <div className="bg-clay/10 border border-clay/30 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-clay shrink-0 animate-pulse" />
            <div>
              <h3 className="font-gothic text-base font-bold uppercase tracking-tight text-clay">
                {pendingTitle}
              </h3>
              <p className="font-serif text-xs text-slate-dark/80 mt-0.5">
                {pendingDescription}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {problem && <ProblemAlert problem={problem} />}

          <Textarea
            label={formLabel}
            placeholder={formPlaceholder}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            helperText={formHelperText}
            required
          />

          <div className="pt-2">
            <Button
              type="submit"
              variant="clay"
              size="lg"
              fullWidth
              isLoading={isLoading}
              leftIcon={<MessageSquare className="w-4 h-4" />}
              className="font-gothic uppercase tracking-wider text-xs justify-center"
            >
              {buttonLabel}
            </Button>
          </div>
        </form>
      )}
    </SecurityActionLayout>
  );
};
