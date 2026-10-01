import React from "react";
import { CheckCircle2, ExternalLink, Pin, PinOff, Sparkles, XCircle } from "lucide-react";
import { Button } from "@shared/components/Button.tsx";
import { useAsyncData } from "@shared/hooks/index.ts";
import { apiClient } from "@shared/api/index.ts";
import { useToast } from "@shared/context/index.ts";
import { AdminLayout } from "../components/AdminLayout.tsx";

export const AdminFeaturedPage: React.FC = () => {
  const { showToast } = useToast();

  const {
    data: recommendations,
    isLoading,
    reload: loadData,
  } = useAsyncData(() => apiClient.getFeaturedRecommendations());

  const handleTogglePin = async (id: string, currentlyPinned: boolean) => {
    await apiClient.toggleCuratedPin(id, !currentlyPinned);
    showToast(
      "success",
      !currentlyPinned
        ? "Creator pinned to curated showcase spotlight."
        : "Creator unpinned from curated showcase."
    );
    loadData();
  };

  const handleApprove = async (id: string) => {
    await apiClient.approveFeaturedRequest(id);
    showToast("success", "Approved for discovery recommendations.");
    loadData();
  };

  const handleReject = async (id: string) => {
    await apiClient.rejectFeaturedRequest(id);
    showToast("info", "Featured request declined.");
    loadData();
  };

  const pinnedItems = recommendations?.filter((item) =>
    Boolean(item.isCuratedPin ?? item.isCuratedPinned)
  ) || [];

  const candidateItems = recommendations?.filter(
    (item) => !Boolean(item.isCuratedPin ?? item.isCuratedPinned)
  ) || [];

  return (
    <AdminLayout
      title="Curated Showcase &amp; Featured Suggestions"
      subtitle="Select outstanding architectural portfolios to appear in the discovery highlights feed."
    >
      <div className="space-y-8">
        {/* Section 1: Active Pinned Creators */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-clay" />
              <h2 className="font-gothic font-bold text-sm uppercase tracking-wider text-slate-dark">
                Currently Spotlighted on Discovery Feed ({pinnedItems.length})
              </h2>
            </div>
            <a
              href="/feed"
              target="_blank"
              rel="noopener noreferrer"
              className="font-gothic text-xs font-semibold uppercase text-clay hover:underline inline-flex items-center gap-1"
            >
              View Live Feed <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {isLoading ? (
            <div className="p-6 bg-ivory-light rounded-2xl border border-stone text-center text-xs font-serif text-cloud-dark">
              Loading spotlighted creators...
            </div>
          ) : pinnedItems.length === 0 ? (
            <div className="p-6 bg-ivory-light rounded-2xl border border-dashed border-stone text-center text-xs font-serif text-cloud-dark">
              No creators are currently pinned to the top of the discovery feed.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pinnedItems.map((item) => {
                const displayName = item.name || item.fullName || item.username;
                const headline = item.specialty || item.headline || "Architecture & Spatial Design";

                return (
                  <div
                    key={item.id}
                    className="bg-ivory-light rounded-2xl border border-clay/50 ring-1 ring-clay/20 p-4 space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5 min-w-0">
                          {item.avatarUrl ? (
                            <img
                              src={item.avatarUrl}
                              alt={displayName}
                              className="w-9 h-9 rounded-full object-cover border border-stone shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-slate-dark text-ivory-light flex items-center justify-center font-gothic text-xs font-bold uppercase shrink-0">
                              {(displayName || "?")[0]}
                            </div>
                          )}
                          <div className="min-w-0">
                            <h4 className="font-gothic text-xs font-bold uppercase tracking-wider text-slate-dark truncate">
                              {displayName}
                            </h4>
                            <span className="font-serif text-[11px] text-cloud-dark block truncate">
                              @{item.username}
                            </span>
                          </div>
                        </div>

                        <span className="px-2 py-0.5 rounded-full bg-clay/15 text-clay font-gothic text-[9px] font-bold uppercase tracking-wider border border-clay/30 flex items-center gap-1 shrink-0">
                          <Sparkles className="w-2.5 h-2.5" /> Pinned
                        </span>
                      </div>

                      <div className="font-gothic text-[11px] font-semibold text-slate-dark/90 truncate">
                        {headline}
                      </div>
                    </div>

                    <div className="pt-2.5 border-t border-stone/40 flex items-center justify-between gap-2">
                      <a
                        href={`/u/${item.username}`}
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
                        onClick={() => handleTogglePin(item.id, true)}
                        leftIcon={<PinOff className="w-3.5 h-3.5" />}
                        className="font-gothic uppercase tracking-wider text-[10px]"
                      >
                        Unpin from Feed
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Section 2: Candidate Requests */}
        <div className="space-y-3">
          <h2 className="font-gothic font-bold text-sm uppercase tracking-wider text-slate-dark">
            Spotlight Candidates &amp; Applications ({candidateItems.length})
          </h2>

          {isLoading ? (
            <div className="p-6 bg-ivory-light rounded-2xl border border-stone text-center text-xs font-serif text-cloud-dark">
              Loading candidate requests...
            </div>
          ) : candidateItems.length === 0 ? (
            <div className="p-6 bg-ivory-light rounded-2xl border border-stone text-center text-xs font-serif text-cloud-dark">
              No pending spotlight candidate submissions.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {candidateItems.map((item) => {
                const displayName = item.name || item.fullName || item.username;
                const headline = item.specialty || item.headline || "Architecture & Spatial Design";

                return (
                  <div
                    key={item.id}
                    className="bg-ivory-light rounded-2xl border border-stone p-5 space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        {item.avatarUrl ? (
                          <img
                            src={item.avatarUrl}
                            alt={displayName}
                            className="w-10 h-10 rounded-full object-cover border border-stone"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-slate-dark text-ivory-light flex items-center justify-center font-gothic text-xs font-bold uppercase">
                            {(displayName || "?")[0]}
                          </div>
                        )}
                        <div>
                          <h4 className="font-gothic text-sm font-bold uppercase tracking-wider text-slate-dark">
                            {displayName}
                          </h4>
                          <span className="font-serif text-xs text-cloud-dark block">
                            @{item.username}
                          </span>
                        </div>
                      </div>

                      <div>
                        <h5 className="font-gothic text-xs font-bold uppercase text-slate-dark mb-1">
                          {headline}
                        </h5>
                        {item.message && (
                          <p className="font-serif text-xs text-slate-dark/75 leading-relaxed bg-ivory-medium p-3 rounded-xl">
                            &ldquo;{item.message}&rdquo;
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-stone/50 flex items-center justify-between gap-2">
                      <Button
                        type="button"
                        variant="clay"
                        size="sm"
                        onClick={() => handleTogglePin(item.id, false)}
                        leftIcon={<Pin className="w-3.5 h-3.5" />}
                        className="font-gothic uppercase tracking-wider text-[11px]"
                      >
                        Pin to Spotlight
                      </Button>

                      {item.status === "pending" && (
                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleReject(item.id)}
                            className="p-1.5 rounded-lg text-red-600 hover:bg-red-500/10 cursor-pointer"
                            title="Decline"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleApprove(item.id)}
                            className="p-1.5 rounded-lg text-[#2e7d32] hover:bg-[#2e7d32]/10 cursor-pointer"
                            title="Approve"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};
