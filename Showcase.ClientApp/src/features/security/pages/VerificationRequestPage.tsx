import { Clock, MessageSquare, ShieldCheck, XCircle } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "@shared/api/apiClient.ts";
import { Button } from "@shared/components/Button.tsx";
import { Textarea } from "@shared/components/Textarea.tsx";
import { VerifiedBadge } from "@shared/components/VerifiedBadge.tsx";
import { useAsyncData } from "@shared/hooks/index.ts";
import { useAuth, useToast } from "@shared/context/index.ts";
import type { ProblemDetails } from "@shared/types/index.ts";
import { ProblemAlert } from "../components/ProblemAlert.tsx";
import { SecurityActionLayout } from "../components/SecurityActionLayout.tsx";

export const VerificationRequestPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const { data: profile, isLoading: isFetching, reload: loadData } = useAsyncData(() => apiClient.getMyProfile());

  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [problem, setProblem] = useState<ProblemDetails | null>(null);

  const isVerified = profile?.isVerified || currentUser?.isVerified;
  const status = profile?.verificationStatus || currentUser?.verificationStatus || (isVerified ? "verified" : "none");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProblem(null);

    const trimmed = message.trim();
    if (!trimmed) {
      setProblem({
        title: "Validation Error",
        detail: "Please provide a brief message for your verification request.",
        status: 400,
      });
      return;
    }

    setIsLoading(true);

    try {
      await apiClient.submitVerificationRequest({
        message: trimmed,
        notes: trimmed,
      });

      showToast("success", "Verification request submitted successfully.");
      loadData();
    } catch (err: unknown) {
      const p = err as ProblemDetails;
      setProblem({
        title: p?.title || "Submission Failed",
        detail: p?.detail || "An error occurred while submitting your verification request.",
        status: p?.status || 400,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SecurityActionLayout
      title="Account Verification"
      subtitle="Obtain an official verified checkmark badge next to your name to establish trust and professional authenticity."
      badge="Authenticity & Trust"
      backTo="/settings/security"
      backLabel="Back to Account Security"
    >
      {/* 1. Status Banner */}
      {status === "verified" || isVerified ? (
        <div className="bg-[#2e7d32]/10 border border-[#2e7d32]/30 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-3">
            <VerifiedBadge size="lg" />
            <div>
              <h3 className="font-gothic text-base font-bold uppercase tracking-tight text-[#2e7d32]">
                Account Officially Verified
              </h3>
              <p className="font-serif text-xs text-[#2e7d32]/90 mt-0.5">
                Your account is verified with the authentic checkmark badge across all posts, profiles, and directories.
              </p>
            </div>
          </div>
          <div className="pt-2 border-t border-[#2e7d32]/20 text-xs font-serif text-[#141413]/70">
            No further action required. Your verified badge is actively displayed.
          </div>
        </div>
      ) : status === "pending" ? (
        <div className="bg-[#d97757]/10 border border-[#d97757]/30 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-[#d97757] shrink-0 animate-pulse" />
            <div>
              <h3 className="font-gothic text-base font-bold uppercase tracking-tight text-[#d97757]">
                Verification Request Pending
              </h3>
              <p className="font-serif text-xs text-[#141413]/80 mt-0.5">
                Your request has been received and is currently under review.
              </p>
            </div>
          </div>
          <p className="font-serif text-xs text-[#87867f] leading-relaxed">
            Review decisions are usually communicated within 2 to 3 business days. Thank you for your patience.
          </p>
        </div>
      ) : status === "rejected" ? (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5 space-y-3 mb-6">
          <div className="flex items-center gap-3">
            <XCircle className="w-6 h-6 text-red-600 shrink-0" />
            <div>
              <h3 className="font-gothic text-base font-bold uppercase tracking-tight text-red-700">
                Previous Request Not Approved
              </h3>
              <p className="font-serif text-xs text-[#141413]/80 mt-0.5">
                You may submit an updated verification request message below.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-[#f0eee6] rounded-2xl p-4 border border-[#cccbc8]/60 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-[#d97757] shrink-0 mt-0.5" />
          <div className="text-xs font-serif text-[#141413]/80 leading-relaxed">
            <strong className="font-gothic font-bold uppercase tracking-wider text-[#141413] block mb-0.5">
              Why get verified?
            </strong>
            Verified members receive a verified checkmark badge next to their name across the feed, search results, and portfolio pages, helping clients and peers verify your credentials.
          </div>
        </div>
      )}

      {/* 2. Simplified Verification Request Form (Shown if not verified or pending) */}
      {!isVerified && status !== "verified" && status !== "pending" && (
        <form onSubmit={handleSubmit} className="space-y-6 mt-6" noValidate>
          <ProblemAlert problem={problem} />

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="verification-message"
                className="flex items-center gap-2 font-gothic text-xs font-bold uppercase tracking-wider text-[#141413]"
              >
                <MessageSquare className="w-4 h-4 text-[#87867f]" />
                <span>Verification Request Message <span className="text-[#d97757]">*</span></span>
              </label>
              <Textarea
                id="verification-message"
                placeholder="Briefly describe your work or explain why you are requesting account verification..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                required
                disabled={isFetching}
              />
              <p className="font-serif text-[11px] text-[#87867f]">
                Provide any background context, portfolio references, or reasons for verification.
              </p>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <Button
              type="submit"
              variant="clay"
              size="lg"
              isLoading={isLoading}
              disabled={isLoading || isFetching || !message.trim()}
              className="w-full sm:w-auto"
            >
              Submit Request
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
      )}
    </SecurityActionLayout>
  );
};
