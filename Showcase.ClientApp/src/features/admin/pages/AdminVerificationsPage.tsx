import React, { useState } from "react";
import { CheckCircle2, Clock, ExternalLink, FileCheck, ShieldCheck, XCircle } from "lucide-react";
import { Button } from "@shared/components/Button.tsx";
import { VerifiedBadge } from "@shared/components/VerifiedBadge.tsx";
import { useAsyncData } from "@shared/hooks/index.ts";
import { apiClient } from "@shared/api/index.ts";
import { useToast } from "@shared/context/index.ts";
import type { VerificationRequestItem } from "@shared/types/index.ts";
import { AdminLayout } from "../components/AdminLayout.tsx";
import { VerificationReviewModal } from "../components/VerificationReviewModal.tsx";

export const AdminVerificationsPage: React.FC = () => {
  const { showToast } = useToast();
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequestItem | null>(null);

  const {
    data: requests,
    isLoading,
    reload: loadRequests,
  } = useAsyncData(() => apiClient.getVerificationRequests());

  const handleApprove = async (requestId: string, note?: string) => {
    await apiClient.approveVerificationRequest(requestId, note);
    showToast("success", "Official verification checkmark badge granted.");
    loadRequests();
  };

  const handleReject = async (requestId: string, note?: string) => {
    await apiClient.rejectVerificationRequest(requestId, note);
    showToast("info", "Verification application declined.");
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
          <Clock className="w-4 h-4 text-[#d97757]" />
          <h2 className="font-gothic text-xs font-bold uppercase tracking-[0.14em] text-[#141413]">
            Pending Queue ({pendingRequests.length})
          </h2>
        </div>

        {isLoading ? (
          <div className="p-8 bg-[#faf9f5] rounded-2xl border border-[#cccbc8] text-center text-xs font-serif text-[#87867f]">
            Loading verification queue...
          </div>
        ) : pendingRequests.length === 0 ? (
          <div className="p-8 bg-[#faf9f5] rounded-2xl border border-[#cccbc8] text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-[#2e7d32] mx-auto opacity-70" />
            <h3 className="font-gothic text-sm font-bold uppercase tracking-wider text-[#141413]">
              All Applications Cleared
            </h3>
            <p className="font-serif text-xs text-[#87867f]">
              There are no pending verification requests requiring review at this time.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingRequests.map((req) => (
              <div
                key={req.id}
                className="bg-[#faf9f5] border border-[#cccbc8] rounded-2xl p-5 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {req.avatarUrl ? (
                        <img
                          src={req.avatarUrl}
                          alt={req.fullName}
                          className="w-10 h-10 rounded-full object-cover border border-[#cccbc8]"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#141413] text-[#faf9f5] flex items-center justify-center font-gothic text-xs font-bold uppercase">
                          {req.fullName[0]}
                        </div>
                      )}
                      <div>
                        <span className="font-gothic font-bold uppercase tracking-wider text-sm text-[#141413]">
                          {req.fullName}
                        </span>
                        <span className="font-serif text-xs text-[#87867f] block">
                          @{req.username} &bull; {req.postsCount} Works
                        </span>
                      </div>
                    </div>

                    <a
                      href={`/u/${req.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg text-[#87867f] hover:text-[#141413] hover:bg-[#e8e5dc] transition-colors"
                      title="View Public Profile"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>

                  <div className="p-3 bg-[#f0eee6] rounded-xl font-serif text-xs text-[#141413]/85 leading-relaxed">
                    &ldquo;{req.message}&rdquo;
                  </div>

                  {req.notes && (
                    <div className="text-[11px] font-serif text-[#87867f]">
                      <strong className="font-gothic font-bold uppercase text-[#141413] text-[10px]">
                        Credentials:{" "}
                      </strong>
                      {req.notes}
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-[#cccbc8]/50 flex items-center justify-between gap-2">
                  <span className="font-serif text-[11px] text-[#87867f]">
                    Submitted {new Date(req.submittedAt).toLocaleDateString()}
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
            ))}
          </div>
        )}
      </section>

      {/* 2. Processed History */}
      {processedRequests.length > 0 && (
        <section className="space-y-4 pt-6 border-t border-[#cccbc8]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#87867f]" />
            <h2 className="font-gothic text-xs font-bold uppercase tracking-[0.14em] text-[#87867f]">
              Processed Decisions ({processedRequests.length})
            </h2>
          </div>

          <div className="bg-[#faf9f5] rounded-2xl border border-[#cccbc8] overflow-hidden">
            <div className="divide-y divide-[#cccbc8]/60">
              {processedRequests.map((req) => (
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
                      <span className="font-gothic font-bold uppercase tracking-wider text-[#141413]">
                        {req.fullName} (@{req.username})
                      </span>
                      {req.decisionNote && (
                        <p className="font-serif text-[#87867f] text-[11px]">{req.decisionNote}</p>
                      )}
                    </div>
                  </div>

                  <span className="font-gothic text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border self-start sm:self-auto bg-[#e8e5dc] text-[#141413] border-[#cccbc8]">
                    {req.status}
                  </span>
                </div>
              ))}
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
