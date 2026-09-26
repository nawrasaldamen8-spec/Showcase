import React, { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@shared/components/Button.tsx";
import { useAsyncData } from "@shared/hooks/index.ts";
import { apiClient } from "@shared/api/index.ts";
import { useToast } from "@shared/context/index.ts";
import type { BroadcastAnnouncementItem } from "@shared/types/index.ts";
import { AdminLayout } from "../components/AdminLayout.tsx";
import { BroadcastComposeModal } from "../components/BroadcastComposeModal.tsx";

export const AdminBroadcastsPage: React.FC = () => {
  const { showToast } = useToast();
  const [isComposeOpen, setIsComposeOpen] = useState(false);

  const {
    data: broadcasts,
    isLoading,
    reload: loadBroadcasts,
  } = useAsyncData(() => apiClient.getBroadcasts());

  const handleSendBroadcast = async (
    item: Omit<BroadcastAnnouncementItem, "id" | "publishedAt" | "adminUsername">
  ) => {
    await apiClient.createBroadcast(item);
    showToast("success", "Official announcement dispatched successfully.");
    loadBroadcasts();
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "contest":
        return "bg-[#d97757]/15 text-[#d97757] border-[#d97757]/30";
      case "warning":
        return "bg-red-500/15 text-red-700 border-red-500/30";
      case "update":
        return "bg-[#2e7d32]/15 text-[#2e7d32] border-[#2e7d32]/30";
      default:
        return "bg-[#e8e5dc] text-[#141413] border-[#cccbc8]";
    }
  };

  return (
    <AdminLayout
      title="Platform Broadcasts &amp; Announcements"
      subtitle="Broadcast global notices, contest invitations, and direct administrative alerts."
      headerAction={
        <Button
          type="button"
          variant="clay"
          size="md"
          onClick={() => setIsComposeOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
          className="font-gothic uppercase tracking-wider text-xs"
        >
          Compose Broadcast
        </Button>
      }
    >
      <div className="space-y-4">
        {isLoading ? (
          <div className="p-8 bg-[#faf9f5] rounded-2xl border border-[#cccbc8] text-center text-xs font-serif text-[#87867f]">
            Loading broadcast history...
          </div>
        ) : !broadcasts || broadcasts.length === 0 ? (
          <div className="p-8 bg-[#faf9f5] rounded-2xl border border-[#cccbc8] text-center text-xs font-serif text-[#87867f]">
            No announcements currently published.
          </div>
        ) : (
          broadcasts.map((b) => (
            <div
              key={b.id}
              className="bg-[#faf9f5] rounded-2xl border border-[#cccbc8] p-6 space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#cccbc8]/60 pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`px-2.5 py-0.5 rounded-full font-gothic text-[10px] font-bold uppercase tracking-wider border ${getSeverityBadge(
                      b.severity
                    )}`}
                  >
                    {b.severity}
                  </span>
                  <h3 className="font-gothic text-base font-bold uppercase tracking-tight text-[#141413]">
                    {b.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2 text-xs font-serif text-[#87867f]">
                  <span>Scope: {b.scope.replace(/_/g, " ")}</span>
                  <span>&bull;</span>
                  <span>{new Date(b.publishedAt).toLocaleDateString()}</span>
                </div>
              </div>

              <p className="font-serif text-sm text-[#141413]/85 leading-relaxed bg-[#f0eee6] p-4 rounded-xl">
                {b.message}
              </p>

              <div className="flex items-center justify-between pt-1 text-[11px] font-serif text-[#87867f]">
                <span>Dispatched by @{b.adminUsername}</span>
                {b.targetUserId && (
                  <span className="font-gothic font-bold text-[#d97757]">
                    Target User: @{b.targetUserId}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Compose Modal */}
      <BroadcastComposeModal
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
        onSend={handleSendBroadcast}
      />
    </AdminLayout>
  );
};
