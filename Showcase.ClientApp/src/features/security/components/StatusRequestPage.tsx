import { Clock, MessageSquare } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { extractApiErrorMessage, queryKeys } from "@shared/api/index.ts";
import { Button } from "@shared/components/Button.tsx";
import { Textarea } from "@shared/components/Textarea.tsx";
import { useAuth } from "@shared/context/index.ts";
import type { ProblemDetails } from "@shared/types/index.ts";
import { useMyProfileQuery } from "../../profile/hooks/useProfileQueries.ts";
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
  const queryClient = useQueryClient();
  const { data: profile } = useMyProfileQuery();

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
      toast.success(successMessage);
      queryClient.invalidateQueries({ queryKey: queryKeys.profiles.me() });
      setMessage("");
    } catch (err: unknown) {
      const msg = extractApiErrorMessage(err);
      toast.error(msg);
      const p = err as ProblemDetails;
      setProblem({
        title: p?.title || "Submission Failed",
        detail: msg,
        status: p?.status || 400,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isApproved) {
    return (
      <SecurityActionLayout title={title} subtitle={subtitle} badge={badge}>
        <div className="bg-ivory-light rounded-card border border-clay/40 p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3 text-clay">
            {approvedRenderIcon()}
            <h2 className="font-gothic text-base sm:text-lg font-bold uppercase tracking-tight text-slate-dark">
              {approvedTitle}
            </h2>
          </div>
          <p className="font-serif text-sm text-slate-dark/85 leading-relaxed">
            {approvedDescription}
          </p>
          <div className="pt-2 border-t border-stone/60">
            <p className="font-serif text-xs text-cloud-dark">
              {approvedFooter}
            </p>
          </div>
        </div>
      </SecurityActionLayout>
    );
  }

  if (status === "pending") {
    return (
      <SecurityActionLayout title={title} subtitle={subtitle} badge={badge}>
        <div className="bg-ivory-light rounded-card border border-stone/60 p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3 text-clay">
            <Clock className="h-6 w-6 shrink-0" />
            <h2 className="font-gothic text-base sm:text-lg font-bold uppercase tracking-tight text-slate-dark">
              {pendingTitle}
            </h2>
          </div>
          <p className="font-serif text-sm text-slate-dark/85 leading-relaxed">
            {pendingDescription}
          </p>
          <div className="pt-2 border-t border-stone/60">
            <p className="font-serif text-xs text-cloud-dark">
              You will receive an in-app notification once the curatorial team reviews your application.
            </p>
          </div>
        </div>
      </SecurityActionLayout>
    );
  }

  return (
    <SecurityActionLayout title={title} subtitle={subtitle} badge={badge}>
      <div className="bg-ivory-light rounded-card border border-stone/60 p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {problem && <ProblemAlert problem={problem} />}

          <Textarea
            label={formLabel}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={formPlaceholder}
            helperText={formHelperText}
            rows={5}
            required
            disabled={isLoading}
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone/60">
            <Button
              type="submit"
              variant="clay"
              size="md"
              isLoading={isLoading}
              leftIcon={<MessageSquare className="h-4 w-4" />}
            >
              {buttonLabel}
            </Button>
          </div>
        </form>
      </div>
    </SecurityActionLayout>
  );
};
