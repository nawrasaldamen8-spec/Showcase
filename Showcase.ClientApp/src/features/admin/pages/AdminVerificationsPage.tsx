import React, { useState } from "react";
import { CheckCircle2, Clock, ExternalLink, FileCheck, ShieldCheck, ShieldOff } from "lucide-react";
import { Button } from "@shared/components/Button.tsx";
import { UserAvatar } from "@shared/components/media/index.ts";
import { VerifiedBadge } from "@shared/components/VerifiedBadge.tsx";
import type { VerificationRequestItem } from "@shared/types/index.ts";
import { AdminLayout } from "../components/AdminLayout.tsx";
import { VerificationReviewModal } from "../components/VerificationReviewModal.tsx";
import {
  useAdminVerificationsQuery,
  useApproveVerificationMutation,
  useRejectVerificationMutation,
  useToggleUserVerificationMutation,
} from "../hooks/useAdminQueries.ts";

type VerificationTab = "pending" | "verified";

export const AdminVerificationsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<VerificationTab>("pending");
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequestItem | null>(null);

  const { data: requests = [], isLoading } = useAdminVerificationsQuery();
  const approveMutation = useApproveVerificationMutation();
  const rejectMutation = useRejectVerificationMutation();
  const toggleVerificationMutation = useToggleUserVerificationMutation();

  const handleApprove = async (requestId: string, note?: string) => {
    await approveMutation.mutateAsync({ requestId, note });
  };

  const handleReject = async (requestId: string, note?: string) => {
    await rejectMutation.mutateAsync({ requestId, note });
  };

  const handleRevokeVerification = async (userId: string) => {
    await toggleVerificationMutation.mutateAsync({ userId, isVerified: false });
  };

  const pendingRequests = requests?.filter((r) => r.status === "pending") || [];
  const verifiedCreators = requests?.filter(
    (r) => Boolean(r.isVerified) || r.status === "verified" || r.status === "approved"
  ) || [];

  return (
    <AdminLayout
      title="Verification Badge Applications"
      subtitle="Review creator credentials and grant authentic checkmark badges to verified architects and studios."
    >
      <div className="space-y-6">
        {/* Top Navigation Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone">
          <nav
            className="flex items-center gap-6 sm:gap-8 overflow-x-auto no-scrollbar"
            aria-label="Verification tabs"
          >
            <button
              type="button"
              onClick={() => setActiveTab("pending")}
              className={`font-gothic text-[13px] font-semibold uppercase tracking-[0.10em] pb-3 whitespace-nowrap transition-colors relative cursor-pointer border-b -mb-[1px] flex items-center gap-2 ${
                activeTab === "pending"
                  ? "text-slate-dark border-slate-dark font-bold"
                  : "text-cloud-dark border-transparent hover:text-slate-dark hover:border-stone"
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-clay" />
              <span>Pending Applications</span>
              <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-stone/30 text-slate-dark font-mono font-bold">
                {pendingRequests.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("verified")}
              className={`font-gothic text-[13px] font-semibold uppercase tracking-[0.10em] pb-3 whitespace-nowrap transition-colors relative cursor-pointer border-b -mb-[1px] flex items-center gap-2 ${
                activeTab === "verified"
                  ? "text-slate-dark border-slate-dark font-bold"
                  : "text-cloud-dark border-transparent hover:text-slate-dark hover:border-stone"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#2e7d32]" />
              <span>Verified Creators</span>
              <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-stone/30 text-slate-dark font-mono font-bold">
                {verifiedCreators.length}
              </span>
            </button>
          </nav>
        </div>

        {/* Tab 1: Pending Queue */}
        {activeTab === "pending" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {isLoading ? (
              <div className="p-8 bg-ivory-light rounded-2xl border border-stone text-center text-xs font-serif text-cloud-dark">
                Loading verification applications...
              </div>
            ) : pendingRequests.length === 0 ? (
              <div className="p-10 bg-ivory-light rounded-2xl border border-stone text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-[#2e7d32] mx-auto opacity-80" />
                <h3 className="font-gothic text-sm font-bold uppercase tracking-wider text-slate-dark">
                  All Applications Cleared
                </h3>
                <p className="font-serif text-xs text-cloud-dark max-w-sm mx-auto">
                  There are no pending verification requests requiring review at this time.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {pendingRequests.map((req) => {
                  const displayName = req.name || req.fullName || req.username;
                  const dateStr = req.createdAt || req.submittedAt;

                  return (
                    <div
                      key={req.id}
                      className="bg-ivory-light border border-stone rounded-2xl p-5 space-y-4 flex flex-col justify-between transition-all"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <UserAvatar
                              src={req.avatarUrl}
                              alt={displayName}
                              size="md"
                              className="w-10 h-10 border border-stone shrink-0"
                            />
                            <div className="min-w-0">
                              <span className="font-gothic font-bold uppercase tracking-wider text-sm text-slate-dark truncate block">
                                {displayName}
                              </span>
                              <span className="font-serif text-xs text-cloud-dark block truncate">
                                @{req.username} {req.postsCount !== undefined ? `• ${req.postsCount} Works` : ""}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {req.category && (
                              <span className="px-2 py-0.5 rounded-full bg-stone/25 border border-stone/60 font-gothic text-[9px] font-bold uppercase tracking-wider text-slate-dark">
                                {req.category}
                              </span>
                            )}
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
                        </div>

                        <div className="p-3.5 bg-ivory-medium rounded-xl font-serif text-xs text-slate-dark/85 leading-relaxed border border-stone/30">
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

                      <div className="pt-3 border-t border-stone/50 flex items-center justify-between gap-2">
                        <span className="font-serif text-[11px] text-cloud-dark">
                          Submitted {dateStr ? new Date(dateStr).toLocaleDateString() : "Recently"}
                        </span>

                        <Button
                          type="button"
                          variant="clay"
                          size="sm"
                          onClick={() => setSelectedRequest(req)}
                          disabled={approveMutation.isPending || rejectMutation.isPending}
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
          </div>
        )}

        {/* Tab 2: Currently Verified Creators */}
        {activeTab === "verified" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {isLoading ? (
              <div className="p-8 bg-ivory-light rounded-2xl border border-stone text-center text-xs font-serif text-cloud-dark">
                Loading verified creators...
              </div>
            ) : verifiedCreators.length === 0 ? (
              <div className="p-10 bg-ivory-light rounded-2xl border border-dashed border-stone text-center space-y-2">
                <ShieldCheck className="w-8 h-8 text-[#2e7d32] mx-auto opacity-70" />
                <h3 className="font-gothic font-bold text-sm uppercase text-slate-dark">
                  No verified creators yet
                </h3>
                <p className="text-xs font-serif text-cloud-dark max-w-sm mx-auto">
                  Approve pending applications or grant badges directly from the User Directory table.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {verifiedCreators.map((req) => {
                  const displayName = req.name || req.fullName || req.username;

                  return (
                    <div
                      key={req.id}
                      className="bg-ivory-light rounded-2xl border border-[#2e7d32]/30 ring-1 ring-[#2e7d32]/15 p-4 space-y-3 flex flex-col justify-between transition-all"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <UserAvatar
                              src={req.avatarUrl}
                              alt={displayName}
                              size="sm"
                              className="w-9 h-9 border border-stone shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <h4 className="font-gothic text-xs font-bold uppercase tracking-wider text-slate-dark truncate">
                                  {displayName}
                                </h4>
                                <VerifiedBadge size="sm" className="shrink-0" />
                              </div>
                              <span className="font-serif text-[11px] text-cloud-dark block truncate">
                                @{req.username} {req.postsCount !== undefined ? `• ${req.postsCount} Works` : ""}
                              </span>
                            </div>
                          </div>

                          <span className="px-2 py-0.5 rounded-full bg-[#2e7d32]/10 text-[#2e7d32] font-gothic text-[9px] font-bold uppercase tracking-wider border border-[#2e7d32]/30 flex items-center gap-1 shrink-0">
                            <CheckCircle2 className="w-2.5 h-2.5" /> Verified
                          </span>
                        </div>

                        {req.specialty && (
                          <div className="font-gothic text-[11px] font-semibold text-slate-dark/90 truncate">
                            {req.specialty}
                          </div>
                        )}
                      </div>

                      <div className="pt-2.5 border-t border-stone/40 flex items-center justify-between gap-2">
                        <a
                          href={`/u/${req.username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cloud-dark hover:text-slate-dark p-1 rounded-lg hover:bg-ivory-medium transition-colors"
                          title="View Public Profile"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleRevokeVerification(req.userId)}
                          disabled={toggleVerificationMutation.isPending}
                          leftIcon={<ShieldOff className="w-3.5 h-3.5" />}
                          className="font-gothic uppercase tracking-wider text-[10px]"
                        >
                          Revoke Verification
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

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
