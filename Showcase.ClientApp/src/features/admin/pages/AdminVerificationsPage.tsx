import React, { useState } from "react";
import { CheckCircle2, Clock, ExternalLink, FileCheck, ShieldCheck, XCircle } from "lucide-react";
import { Button } from "@shared/components/Button.tsx";
import { VerifiedBadge } from "@shared/components/VerifiedBadge.tsx";
import { useAsyncData } from "@shared/hooks/index.ts";
import { apiClient } from "@shared/api/index.ts";
import { toast } from "sonner";
import type { VerificationRequestItem } from "@shared/types/index.ts";
import { AdminLayout } from "../components/AdminLayout.tsx";
import { VerificationReviewModal } from "../components/VerificationReviewModal.tsx";

export const AdminVerificationsPage: React.FC = () => {
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequestItem | null>(null);

  const {
    data: requests,
    isLoading,
    reload: loadRequests,
  } = useAsyncData(() => apiClient.getVerificationRequests());

  const handleApprove = async (requestId: string, note?: string) => {
    await apiClient.approveVerificationRequest(requestId, note);
    toast.success("Official verification checkmark badge granted.");
    loadRequests();
  };

  const handleReject = async (requestId: string, note?: string) => {
    await apiClient.rejectVerificationRequest(requestId, note);
    toast.info("Verification application declined.");
    loadRequests();
  };

  const pendingRequests = requests?.filter((r) => r.status === "pending") || [];
  const processedRequests = requests?.filter((r) => r.status !== "pending") || [];

  return (
    <AdminLayout
      title="Verification Badge Applications"
      subtitle="Review creator credentials and grant authentic checkmark badges to verified architects and studios."
    >
      {/* 1. Pending Queue */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-clay" />
          <h2 className="font-gothic text-xs font-bold uppercase tracking-[0.14em] text-slate-dark">
            Pending Queue ({pendingRequests.length})
          </h2>
        </div>

        {isLoading ? (
          <div className="p-8 bg-ivory-light rounded-2xl border border-stone text-center text-xs font-serif text-cloud-dark">
            Loading verification queue...
          </div>
        ) : pendingRequests.length === 0 ? (
          <div className="p-8 bg-ivory-light rounded-2xl border border-stone text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-[#2e7d32] mx-auto opacity-70" />
            <h3 className="font-gothic text-sm font-bold uppercase tracking-wider text-slate-dark">
              All Applications Cleared
            </h3>
            <p className="font-serif text-xs text-cloud-dark">
              There are no pending verification requests requiring review at this time.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingRequests.map((req) => {
              const displayName = req.name || req.fullName || req.username;
              const dateStr = req.createdAt || req.submittedAt;
              return (
                <div
                  key={req.id}
                  className="bg-ivory-light border border-stone rounded-2xl p-5 space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {req.avatarUrl ? (
                          <img
                            src={req.avatarUrl}
                            alt={displayName}
                            className="w-10 h-10 rounded-full object-cover border border-stone"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-slate-dark text-ivory-light flex items-center justify-center font-gothic text-xs font-bold uppercase">
                            {(displayName || "?")[0]}
                          </div>
                        )}
                        <div>
                          <span className="font-gothic font-bold uppercase tracking-wider text-sm text-slate-dark">
                            {displayName}
                          </span>
                          <span className="font-serif text-xs text-cloud-dark block">
                            @{req.username} {req.postsCount !== undefined ? `• ${req.postsCount} Works` : ""}
                          </span>
                        </div>
                      </div>

                      <a
                        href={`/u/${req.username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg text-cloud-dark hover:text-slate-dark hover:bg-[#e8e5dc] transition-colors"
                        title="View Public Profile"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>

                    <div className="p-3 bg-ivory-medium rounded-xl font-serif text-xs text-slate-dark/85 leading-relaxed">
                      &ldquo;{req.message}&rdquo;
                    </div>

                    {req.notes && (
                      <div className="text-[11px] font-serif text-cloud-dark">
                        <strong className="font-gothic font-bold uppercase text-slate-dark text-[10px]">
                          Credentials:{" "}
                        </strong>
                        {req.notes}
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-stone/50 flex items-center justify-between gap-2">
                    <span className="font-serif text-[11px] text-cloud-dark">
                      Submitted {dateStr ? new Date(dateStr).toLocaleDateString() : "Recently"}
                    </span>

                    <Button
                      type="button"
                      variant="clay"
                      size="sm"
                      onClick={() => setSelectedRequest(req)}
                      leftIcon={<FileCheck className="w-3.5 h-3.5" />}
                    >
                      Examine &amp; Decide
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 2. Processed History */}
      {processedRequests.length > 0 && (
        <section className="space-y-4 pt-6 border-t border-stone">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cloud-dark" />
            <h2 className="font-gothic text-xs font-bold uppercase tracking-[0.14em] text-cloud-dark">
              Processed Decisions ({processedRequests.length})
            </h2>
          </div>

          <div className="bg-ivory-light rounded-2xl border border-stone overflow-hidden">
            <div className="divide-y divide-stone/60">
              {processedRequests.map((req) => {
                const displayName = req.name || req.fullName || req.username;
                return (
                  <div
                    key={req.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      {req.status === "approved" ? (
                        <VerifiedBadge size="md" />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-red-500/10 text-red-600 flex items-center justify-center">
                          <XCircle className="w-4 h-4" />
                        </div>
                      )}
                      <div>
                        <span className="font-gothic font-bold uppercase tracking-wider text-slate-dark">
                          {displayName} (@{req.username})
                        </span>
                        {req.decisionNote && (
                          <p className="font-serif text-cloud-dark text-[11px]">{req.decisionNote}</p>
                        )}
                      </div>
                    </div>

                    <span className="font-gothic text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border self-start sm:self-auto bg-[#e8e5dc] text-slate-dark border-stone">
                      {req.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Review & Decision Modal */}
      <VerificationReviewModal
        request={selectedRequest}
        isOpen={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </AdminLayout>
  );
};
