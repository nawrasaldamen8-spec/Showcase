import React from "react";
import { CheckCircle2, Pin, PinOff, Sparkles, XCircle } from "lucide-react";
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

  return (
    <AdminLayout
      title="Curated Showcase &amp; Featured Suggestions"
      subtitle="Select outstanding architectural portfolios to appear in the discovery highlights feed."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {isLoading ? (
          <div className="col-span-full p-8 bg-[#faf9f5] rounded-2xl border border-[#cccbc8] text-center text-xs font-serif text-[#87867f]">
            Loading curated items...
          </div>
        ) : !recommendations || recommendations.length === 0 ? (
          <div className="col-span-full p-8 bg-[#faf9f5] rounded-2xl border border-[#cccbc8] text-center text-xs font-serif text-[#87867f]">
            No candidates in the featured recommendations pool.
          </div>
        ) : (
          recommendations.map((item) => (
            <div
              key={item.id}
              className={`bg-[#faf9f5] rounded-2xl border p-5 space-y-4 flex flex-col justify-between transition-all ${
                item.isCuratedPinned
                  ? "border-[#d97757] ring-1 ring-[#d97757]/30"
                  : "border-[#cccbc8]"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {item.avatarUrl ? (
                      <img
                        src={item.avatarUrl}
                        alt={item.fullName}
                        className="w-10 h-10 rounded-full object-cover border border-[#cccbc8]"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#141413] text-[#faf9f5] flex items-center justify-center font-gothic text-xs font-bold uppercase">
                        {item.fullName[0]}
                      </div>
                    )}
                    <div>
                      <h4 className="font-gothic text-sm font-bold uppercase tracking-wider text-[#141413]">
                        {item.fullName}
                      </h4>
                      <span className="font-serif text-xs text-[#87867f] block">
                        @{item.username}
                      </span>
                    </div>
                  </div>

                  {item.isCuratedPinned && (
                    <span className="px-2 py-0.5 rounded-full bg-[#d97757]/15 text-[#d97757] font-gothic text-[10px] font-bold uppercase tracking-wider border border-[#d97757]/30 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Pinned
                    </span>
                  )}
                </div>

                <div>
                  <h5 className="font-gothic text-xs font-bold uppercase text-[#141413] mb-1">
                    {item.headline}
                  </h5>
                  <p className="font-serif text-xs text-[#141413]/75 leading-relaxed bg-[#f0eee6] p-3 rounded-xl">
                    &ldquo;{item.message}&rdquo;
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-[#cccbc8]/50 flex items-center justify-between gap-2">
                <Button
                  type="button"
                  variant={item.isCuratedPinned ? "outline" : "clay"}
                  size="sm"
                  onClick={() => handleTogglePin(item.id, item.isCuratedPinned)}
                  leftIcon={item.isCuratedPinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                  className="font-gothic uppercase tracking-wider text-[11px]"
                >
                  {item.isCuratedPinned ? "Unpin Spotlight" : "Pin to Spotlight"}
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
          ))
        )}
      </div>
    </AdminLayout>
  );
};
