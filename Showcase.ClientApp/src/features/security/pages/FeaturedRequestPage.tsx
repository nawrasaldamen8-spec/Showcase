import { Clock, MessageSquare, Sparkles, XCircle } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "@shared/api/apiClient.ts";
import { Button } from "@shared/components/Button.tsx";
import { Textarea } from "@shared/components/Textarea.tsx";
import { useAsyncData } from "@shared/hooks/index.ts";
import { useAuth, useToast } from "@shared/context/index.ts";
import type { ProblemDetails } from "@shared/types/index.ts";
import { ProblemAlert } from "../components/ProblemAlert.tsx";
import { SecurityActionLayout } from "../components/SecurityActionLayout.tsx";

export const FeaturedRequestPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const { data: profile, isLoading: isFetching, reload: loadData } = useAsyncData(() => apiClient.getMyProfile());

  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [problem, setProblem] = useState<ProblemDetails | null>(null);

  const status = profile?.featuredStatus || currentUser?.featuredStatus || "none";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProblem(null);

    const trimmed = message.trim();
    if (!trimmed) {
      setProblem({
        title: "Validation Error",
        detail: "Please provide a brief message for your featured suggestions request.",
        status: 400,
      });
      return;
    }

    setIsLoading(true);

    try {
      await apiClient.submitFeaturedRequest({
        message: trimmed,
        notes: trimmed,
      });

      showToast("success", "Featured suggestions request submitted successfully.");
      loadData();
    } catch (err: unknown) {
      const p = err as ProblemDetails;
      setProblem({
        title: p?.title || "Submission Failed",
        detail: p?.detail || "An error occurred while submitting your featured request.",
        status: p?.status || 400,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SecurityActionLayout
      title="Featured Suggestions Request"
      subtitle="Apply to have your profile and architectural projects featured in creator suggestions and discovery recommendations."
      badge="Discovery & Promotion"
      backTo="/settings/security"
      backLabel="Back to Account Security"
    >
      {/* 1. Status Banner */}
      {status === "featured" ? (
        <div className="bg-[#2e7d32]/10 border border-[#2e7d32]/30 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#2e7d32]/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-[#2e7d32]" />
            </div>
            <div>
              <h3 className="font-gothic text-base font-bold uppercase tracking-tight text-[#2e7d32]">
                Profile Actively Featured
              </h3>
              <p className="font-serif text-xs text-[#2e7d32]/90 mt-0.5">
                Your profile and portfolio are featured in creator discovery recommendations and suggestions across Pority.
              </p>
            </div>
          </div>
          <div className="pt-2 border-t border-[#2e7d32]/20 text-xs font-serif text-[#141413]/70">
            No further action required. Your showcase is in active rotation.
          </div>
        </div>
      ) : status === "pending" ? (
        <div className="bg-[#d97757]/10 border border-[#d97757]/30 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-[#d97757] shrink-0 animate-pulse" />
            <div>
              <h3 className="font-gothic text-base font-bold uppercase tracking-tight text-[#d97757]">
                Featured Request Pending
              </h3>
              <p className="font-serif text-xs text-[#141413]/80 mt-0.5">
                Your request has been received and is currently under review by our curation team.
              </p>
            </div>
          </div>
          <p className="font-serif text-xs text-[#87867f] leading-relaxed">
            Curators review submissions on a weekly cycle. Thank you for your patience.
          </p>
        </div>
      ) : status === "rejected" ? (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5 space-y-3 mb-6">
          <div className="flex items-center gap-3">
            <XCircle className="w-6 h-6 text-red-600 shrink-0" />
            <div>
              <h3 className="font-gothic text-base font-bold uppercase tracking-tight text-red-700">
                Previous Request Not Selected
              </h3>
              <p className="font-serif text-xs text-[#141413]/80 mt-0.5">
                You may submit an updated request message with new work or projects below.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-[#f0eee6] rounded-2xl p-4 border border-[#cccbc8]/60 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-[#d97757] shrink-0 mt-0.5" />
          <div className="text-xs font-serif text-[#141413]/80 leading-relaxed">
            <strong className="font-gothic font-bold uppercase tracking-wider text-[#141413] block mb-0.5">
              Why apply for featured suggestions?
            </strong>
            Featured creators gain prominent spotlighting across Pority discovery feeds, suggested creators lists, and curated search showcases.
          </div>
        </div>
      )}

      {/* 2. Simplified Request Form (Shown if not featured or pending) */}
      {status !== "featured" && status !== "pending" && (
        <form onSubmit={handleSubmit} className="space-y-6 mt-6" noValidate>
          <ProblemAlert problem={problem} />

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="featured-message"
                className="flex items-center gap-2 font-gothic text-xs font-bold uppercase tracking-wider text-[#141413]"
              >
                <MessageSquare className="w-4 h-4 text-[#87867f]" />
                <span>Featured Request Message <span className="text-[#d97757]">*</span></span>
              </label>
              <Textarea
                id="featured-message"
                placeholder="Briefly describe your design portfolio or why your profile should be featured in suggestions..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                required
                disabled={isFetching}
              />
              <p className="font-serif text-[11px] text-[#87867f]">
                Provide any highlights, specializations, or projects you would like highlighted.
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
