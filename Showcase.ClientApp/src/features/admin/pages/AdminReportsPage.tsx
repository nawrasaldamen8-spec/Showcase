import React, { useState } from "react";
import { CheckCircle2, ShieldAlert } from "lucide-react";
import { Button } from "@shared/components/Button.tsx";
import type { ContentReportItem } from "@shared/types/index.ts";
import { AdminLayout } from "../components/AdminLayout.tsx";
import { ReportActionModal } from "../components/ReportActionModal.tsx";
import {
  useAdminReportsQuery,
  useDismissReportMutation,
  useResolveReportMutation,
} from "../hooks/useAdminQueries.ts";

export const AdminReportsPage: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedReport, setSelectedReport] = useState<ContentReportItem | null>(null);

  const { data: reports = [], isLoading } = useAdminReportsQuery(statusFilter);
  const resolveMutation = useResolveReportMutation();
  const dismissMutation = useDismissReportMutation();

  const handleResolve = async (reportId: string, actionTaken: string) => {
    await resolveMutation.mutateAsync({ reportId, actionTaken });
  };

  const handleDismiss = async (reportId: string) => {
    await dismissMutation.mutateAsync(reportId);
  };

  return (
    <AdminLayout
      title="Incident &amp; Reports Center"
      subtitle="Examine copyright claims, impersonation reports, and architectural content policy violations."
    >
      {/* Filter Tabs */}
      <div className="bg-ivory-light p-3 rounded-2xl border border-stone flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {["all", "pending", "resolved", "dismissed"].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-xl font-gothic text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                statusFilter === s
                  ? "bg-slate-dark text-ivory-light"
                  : "text-cloud-dark hover:text-slate-dark hover:bg-[#e8e5dc]/60"
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
          <div className="p-8 bg-ivory-light rounded-2xl border border-stone text-center text-xs font-serif text-cloud-dark">
            Loading reports queue...
          </div>
        ) : !reports || reports.length === 0 ? (
          <div className="p-8 bg-ivory-light rounded-2xl border border-stone text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-[#2e7d32] mx-auto opacity-70" />
            <h3 className="font-gothic text-sm font-bold uppercase tracking-wider text-slate-dark">
              No Open Incidents
            </h3>
            <p className="font-serif text-xs text-cloud-dark">
              There are no reports matching the selected filter.
            </p>
          </div>
        ) : (
          reports.map((rep) => (
            <div
              key={rep.id}
              className="bg-ivory-light border border-stone rounded-2xl p-5 space-y-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full font-gothic text-[10px] font-bold uppercase tracking-wider bg-red-500/15 text-red-700 border border-red-500/30">
                    {rep.reason}
                  </span>
                  <span className="font-gothic text-xs font-bold uppercase tracking-wider text-slate-dark">
                    {rep.targetType.toUpperCase()}: {rep.targetTitle || rep.targetLabel || rep.targetId}
                  </span>
                  {rep.targetAuthorUsername && (
                    <>
                      <span className="text-cloud-dark">&bull;</span>
                      <span className="font-serif text-xs text-cloud-dark">
                        Author: @{rep.targetAuthorUsername}
                      </span>
                    </>
                  )}
                </div>

                <p className="font-serif text-xs text-slate-dark/85 leading-relaxed bg-ivory-medium p-3 rounded-xl">
                  {rep.details || rep.targetLabel || "No statement provided."}
                </p>

                <div className="flex items-center gap-3 text-[11px] font-serif text-cloud-dark">
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
                    disabled={resolveMutation.isPending || dismissMutation.isPending}
                    leftIcon={<ShieldAlert className="w-3.5 h-3.5" />}
                  >
                    Moderate
                  </Button>
                ) : (
                  <span className="px-3 py-1 rounded-full font-gothic text-[10px] font-bold uppercase tracking-wider bg-[#e8e5dc] text-cloud-dark border border-stone">
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
