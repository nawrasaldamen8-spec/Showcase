import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Database,
  FileCheck,
  History,
  ShieldAlert,
  Sparkles,
  Users,
} from "lucide-react";
import { Button } from "@shared/components/Button.tsx";
import { useAsyncData } from "@shared/hooks/index.ts";
import { apiClient } from "@shared/api/index.ts";
import { formatBytes } from "@shared/utils/format.ts";
import { AdminKpiCard } from "../components/AdminKpiCard.tsx";
import { AdminLayout } from "../components/AdminLayout.tsx";

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: metrics } = useAsyncData(() => apiClient.getDashboardMetrics());

  return (
    <AdminLayout
      title="Governance Overview"
      subtitle="Real-time telemetry, moderation queues, and system performance metrics."
      headerAction={
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate("/admin/audit-logs")}
            leftIcon={<History className="w-3.5 h-3.5" />}
          >
            Audit Logs
          </Button>
          <Button
            type="button"
            variant="clay"
            size="sm"
            onClick={() => navigate("/admin/verifications")}
            leftIcon={<FileCheck className="w-3.5 h-3.5" />}
          >
            Review Badges
          </Button>
        </div>
      }
    >
      {/* 1. KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminKpiCard
          title="Total Registered"
          value={metrics?.totalUsersCount ?? "—"}
          subtitle="Active community accounts"
          icon={Users}
          onClick={() => navigate("/admin/users")}
        />

        <AdminKpiCard
          title="Pending Badges"
          value={metrics?.pendingVerificationsCount ?? "—"}
          subtitle="Verification applications"
          icon={FileCheck}
          badge={metrics && metrics.pendingVerificationsCount > 0 ? "Action Required" : undefined}
          badgeVariant="warning"
          onClick={() => navigate("/admin/verifications")}
        />

        <AdminKpiCard
          title="Open Reports"
          value={metrics?.pendingReportsCount ?? "—"}
          subtitle="Abuse & copyright incidents"
          icon={ShieldAlert}
          badge={metrics && metrics.pendingReportsCount > 0 ? "Urgent" : undefined}
          badgeVariant="danger"
          onClick={() => navigate("/admin/reports")}
        />

        <AdminKpiCard
          title="Media Storage Used"
          value={metrics && typeof metrics.storageUsedBytes === "number" ? formatBytes(metrics.storageUsedBytes) : "—"}
          subtitle={`of ${metrics && typeof metrics.storageCapacityBytes === "number" ? formatBytes(metrics.storageCapacityBytes) : "25 GB"} limit`}
          icon={Database}
          onClick={() => navigate("/admin/storage")}
        />
      </div>

      {/* 2. Middle Section: Recent Security Audit Trail & Active Broadcasts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4">
        {/* Left 7 cols: Audit Trail */}
        <div className="lg:col-span-7 bg-ivory-light border border-stone rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-stone/60 pb-3">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-clay" />
              <h3 className="font-gothic text-xs font-bold uppercase tracking-wider text-slate-dark">
                Recent Administrative Decisions
              </h3>
            </div>
            <Link
              to="/admin/audit-logs"
              className="font-gothic text-[11px] font-bold uppercase tracking-wider text-clay hover:underline flex items-center gap-1 text-decoration-none"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {metrics?.recentAuditLogs && metrics.recentAuditLogs.length > 0 ? (
              metrics.recentAuditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-ivory-medium border border-stone/60 flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-gothic font-bold uppercase tracking-wider text-slate-dark">
                        {log.action.replace(/_/g, " ")}
                      </span>
                      <span className="text-cloud-dark">&bull;</span>
                      <span className="text-clay font-medium">{log.targetLabel}</span>
                    </div>
                    {log.reason && (
                      <p className="font-serif text-slate-dark/75 text-[11px] truncate">{log.reason}</p>
                    )}
                  </div>
                  <span className="font-serif text-[10px] text-cloud-dark shrink-0">
                    {new Date(log.timestamp).toLocaleDateString()}
                  </span>
                </div>
              ))
            ) : (
              <p className="font-serif text-xs text-cloud-dark py-4 text-center">
                No recent administrative actions recorded.
              </p>
            )}
          </div>
        </div>

        {/* Right 5 cols: Governance Actions & Quick Links */}
        <div className="lg:col-span-5 space-y-6">
          {/* Governance Direct Hub */}
          <div className="bg-ivory-light border border-stone rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone/60 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-clay" />
                <h3 className="font-gothic text-xs font-bold uppercase tracking-wider text-slate-dark">
                  Governance Action Center
                </h3>
              </div>
            </div>

            <div className="space-y-2.5">
              <Link
                to="/admin/users"
                className="p-3 rounded-xl bg-ivory-medium border border-stone/60 flex items-center justify-between hover:border-clay transition-colors text-decoration-none group"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-slate-dark group-hover:text-clay" />
                  <span className="font-gothic text-xs font-bold uppercase tracking-wider text-slate-dark">
                    Member Directory &amp; Roles
                  </span>
                </div>
                <span className="font-serif text-[11px] text-cloud-dark font-medium">
                  {metrics?.totalUsersCount ?? 0} Accounts
                </span>
              </Link>

              <Link
                to="/admin/verifications"
                className="p-3 rounded-xl bg-ivory-medium border border-stone/60 flex items-center justify-between hover:border-clay transition-colors text-decoration-none group"
              >
                <div className="flex items-center gap-2.5">
                  <FileCheck className="w-4 h-4 text-slate-dark group-hover:text-clay" />
                  <span className="font-gothic text-xs font-bold uppercase tracking-wider text-slate-dark">
                    Creator Verifications
                  </span>
                </div>
                {metrics && metrics.pendingVerificationsCount > 0 ? (
                  <span className="px-2 py-0.5 rounded-full bg-clay/15 text-clay font-gothic text-[10px] font-bold">
                    {metrics.pendingVerificationsCount} Pending
                  </span>
                ) : (
                  <span className="font-serif text-[11px] text-cloud-dark">All clear</span>
                )}
              </Link>

              <Link
                to="/admin/reports"
                className="p-3 rounded-xl bg-ivory-medium border border-stone/60 flex items-center justify-between hover:border-clay transition-colors text-decoration-none group"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-slate-dark group-hover:text-clay" />
                  <span className="font-gothic text-xs font-bold uppercase tracking-wider text-slate-dark">
                    Content Moderation Reports
                  </span>
                </div>
                {metrics && metrics.pendingReportsCount > 0 ? (
                  <span className="px-2 py-0.5 rounded-full bg-red-500/15 text-red-600 font-gothic text-[10px] font-bold">
                    {metrics.pendingReportsCount} Needs Action
                  </span>
                ) : (
                  <span className="font-serif text-[11px] text-cloud-dark">0 Incidents</span>
                )}
              </Link>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="p-5 rounded-2xl bg-slate-dark text-ivory-light space-y-3">
            <h4 className="font-gothic text-xs font-bold uppercase tracking-wider text-clay">
              Curated Showcase Promotion
            </h4>
            <p className="font-serif text-xs text-ivory-light/80 leading-relaxed">
              Curate exceptional architectural projects to be spotlighted across the global discovery feed.
            </p>
            <Link to="/admin/featured" className="inline-block text-decoration-none pt-1">
              <Button
                type="button"
                variant="clay"
                size="sm"
                leftIcon={<Sparkles className="w-3.5 h-3.5" />}
                className="font-gothic uppercase tracking-wider text-[11px]"
              >
                Manage Curated Works
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
