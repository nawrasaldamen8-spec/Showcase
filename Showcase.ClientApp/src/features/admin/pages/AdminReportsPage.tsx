import React, { useState } from "react";
import { CheckCircle2, ShieldAlert } from "lucide-react";
import { Button } from "@shared/components/Button.tsx";
import { useAsyncData } from "@shared/hooks/index.ts";
import { apiClient } from "@shared/api/index.ts";
import { useToast } from "@shared/context/index.ts";
import type { ContentReportItem } from "@shared/types/index.ts";
import { AdminLayout } from "../components/AdminLayout.tsx";
import { ReportActionModal } from "../components/ReportActionModal.tsx";

export const AdminReportsPage: React.FC = () => {
  const { showToast } = useToast();
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedReport, setSelectedReport] = useState<ContentReportItem | null>(null);

  const {
    data: reports,
    isLoading,
    reload: loadReports,
  } = useAsyncData(() => apiClient.getContentReports(statusFilter));

  React.useEffect(() => {
    loadReports();
  }, [statusFilter, loadReports]);

  const handleResolve = async (reportId: string, actionTaken: string) => {
    await apiClient.resolveReport(reportId, actionTaken);
    showToast("success", "Report resolved and corrective moderation action recorded.");
    loadReports();
  };

  const handleDismiss = async (reportId: string) => {
    await apiClient.dismissReport(reportId);
    showToast("info", "Report dismissed.");
    loadReports();
  };

  return (
    <AdminLayout
      title="Incident &amp; Reports Center"
      subtitle="Examine copyright claims, impersonation reports, and architectural content policy violations."
    >
      {/* Filter Tabs */}
      <div className="bg-[#faf9f5] p-3 rounded-2xl border border-[#cccbc8] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {["all", "pending", "resolved", "dismissed"].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-xl font-gothic text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                statusFilter === s
                  ? "bg-[#141413] text-[#faf9f5]"
                  : "text-[#87867f] hover:text-[#141413] hover:bg-[#e8e5dc]/60"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="p-8 bg-[#faf9f5] rounded-2xl border border-[#cccbc8] text-center text-xs font-serif text-[#87867f]">
            Loading reports queue...
          </div>
        ) : !reports || reports.length === 0 ? (
          <div className="p-8 bg-[#faf9f5] rounded-2xl border border-[#cccbc8] text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-[#2e7d32] mx-auto opacity-70" />
            <h3 className="font-gothic text-sm font-bold uppercase tracking-wider text-[#141413]">
              No Open Incidents
            </h3>
            <p className="font-serif text-xs text-[#87867f]">
              There are no reports matching the selected filter.
            </p>
          </div>
        ) : (
          reports.map((rep) => (
            <div
              key={rep.id}
              className="bg-[#faf9f5] border border-[#cccbc8] rounded-2xl p-5 space-y-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full font-gothic text-[10px] font-bold uppercase tracking-wider bg-red-500/15 text-red-700 border border-red-500/30">
                    {rep.reason}
                  </span>
                  <span className="font-gothic text-xs font-bold uppercase tracking-wider text-[#141413]">
                    {rep.targetType.toUpperCase()}: {rep.targetTitle}
                  </span>
                  <span className="text-[#87867f]">&bull;</span>
                  <span className="font-serif text-xs text-[#87867f]">
                    Author: @{rep.targetAuthorUsername}
                  </span>
                </div>

                <p className="font-serif text-xs text-[#141413]/85 leading-relaxed bg-[#f0eee6] p-3 rounded-xl">
                  {rep.details}
                </p>

                <div className="flex items-center gap-3 text-[11px] font-serif text-[#87867f]">
                  <span>Reported by @{rep.reporterUsername}</span>
                  <span>&bull;</span>
                  <span>{new Date(rep.createdAt).toLocaleDateString()}</span>
                  {rep.actionTaken && (
                    <>
                      <span>&bull;</span>
                      <span className="text-[#2e7d32] font-medium">{rep.actionTaken}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                {rep.status === "pending" ? (
                  <Button
                    type="button"
                    variant="clay"
                    size="sm"
                    onClick={() => setSelectedReport(rep)}
                    leftIcon={<ShieldAlert className="w-3.5 h-3.5" />}
                  >
                    Moderate
                  </Button>
                ) : (
                  <span className="px-3 py-1 rounded-full font-gothic text-[10px] font-bold uppercase tracking-wider bg-[#e8e5dc] text-[#87867f] border border-[#cccbc8]">
                    {rep.status}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Moderation Action Modal */}
      <ReportActionModal
        report={selectedReport}
        isOpen={!!selectedReport}
        onClose={() => setSelectedReport(null)}
        onResolve={handleResolve}
        onDismiss={handleDismiss}
      />
    </AdminLayout>
  );
};
