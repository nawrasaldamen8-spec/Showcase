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
        return "bg-clay/15 text-clay border-clay/30";
      case "warning":
        return "bg-red-500/15 text-red-700 border-red-500/30";
      case "update":
        return "bg-[#2e7d32]/15 text-[#2e7d32] border-[#2e7d32]/30";
      default:
        return "bg-[#e8e5dc] text-slate-dark border-stone";
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
          <div className="p-8 bg-ivory-light rounded-2xl border border-stone text-center text-xs font-serif text-cloud-dark">
            Loading broadcast history...
          </div>
        ) : !broadcasts || broadcasts.length === 0 ? (
          <div className="p-8 bg-ivory-light rounded-2xl border border-stone text-center text-xs font-serif text-cloud-dark">
            No announcements currently published.
          </div>
        ) : (
          broadcasts.map((b) => (
            <div
              key={b.id}
              className="bg-ivory-light rounded-2xl border border-stone p-6 space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone/60 pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`px-2.5 py-0.5 rounded-full font-gothic text-[10px] font-bold uppercase tracking-wider border ${getSeverityBadge(
                      b.severity
                    )}`}
                  >
                    {b.severity}
                  </span>
                  <h3 className="font-gothic text-base font-bold uppercase tracking-tight text-slate-dark">
                    {b.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2 text-xs font-serif text-cloud-dark">
                  <span>Scope: {b.scope.replace(/_/g, " ")}</span>
                  <span>&bull;</span>
                  <span>{new Date(b.publishedAt).toLocaleDateString()}</span>
                </div>
              </div>

              <p className="font-serif text-sm text-slate-dark/85 leading-relaxed bg-ivory-medium p-4 rounded-xl">
                {b.message}
              </p>

              <div className="flex items-center justify-between pt-1 text-[11px] font-serif text-cloud-dark">
                <span>Dispatched by @{b.adminUsername}</span>
                {b.targetUserId && (
                  <span className="font-gothic font-bold text-clay">
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
