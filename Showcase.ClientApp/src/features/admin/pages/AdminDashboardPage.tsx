import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Database,
  FileCheck,
  History,
  Megaphone,
  ShieldAlert,
  Sparkles,
  Users,
} from "lucide-react";
import { Button } from "@shared/components/Button.tsx";
import { useAsyncData } from "@shared/hooks/index.ts";
import { apiClient } from "@shared/api/index.ts";
import { AdminKpiCard } from "../components/AdminKpiCard.tsx";
import { AdminLayout } from "../components/AdminLayout.tsx";

function formatBytes(bytes: number): string {
  if (!bytes) return "0 GB";
  const gb = bytes / (1024 * 1024 * 1024);
  return `${gb.toFixed(1)} GB`;
}

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
            onClick={() => navigate("/admin/broadcasts")}
            leftIcon={<Megaphone className="w-3.5 h-3.5" />}
          >
            New Broadcast
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
          title="R2 Storage Used"
          value={metrics ? formatBytes(metrics.storageUsedBytes) : "—"}
          subtitle={`of ${metrics ? formatBytes(metrics.storageCapacityBytes) : "50 GB"} limit`}
          icon={Database}
          onClick={() => navigate("/admin/storage")}
        />
      </div>

      {/* 2. Middle Section: Recent Security Audit Trail & Active Broadcasts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4">
        {/* Left 7 cols: Audit Trail */}
        <div className="lg:col-span-7 bg-[#faf9f5] border border-[#cccbc8] rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#cccbc8]/60 pb-3">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-[#d97757]" />
              <h3 className="font-gothic text-xs font-bold uppercase tracking-wider text-[#141413]">
                Recent Administrative Decisions
              </h3>
            </div>
            <Link
              to="/admin/audit-logs"
              className="font-gothic text-[11px] font-bold uppercase tracking-wider text-[#d97757] hover:underline flex items-center gap-1 text-decoration-none"
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
                  className="p-3 rounded-xl bg-[#f0eee6] border border-[#cccbc8]/60 flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-gothic font-bold uppercase tracking-wider text-[#141413]">
                        {log.action.replace(/_/g, " ")}
                      </span>
                      <span className="text-[#87867f]">&bull;</span>
                      <span className="text-[#d97757] font-medium">{log.targetLabel}</span>
                    </div>
                    {log.reason && (
                      <p className="font-serif text-[#141413]/75 text-[11px] truncate">{log.reason}</p>
                    )}
                  </div>
                  <span className="font-serif text-[10px] text-[#87867f] shrink-0">
                    {new Date(log.timestamp).toLocaleDateString()}
                  </span>
                </div>
              ))
            ) : (
              <p className="font-serif text-xs text-[#87867f] py-4 text-center">
                No recent administrative actions recorded.
              </p>
            )}
          </div>
        </div>

        {/* Right 5 cols: Active Broadcasts & Quick Links */}
        <div className="lg:col-span-5 space-y-6">
          {/* Active Broadcasts */}
          <div className="bg-[#faf9f5] border border-[#cccbc8] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#cccbc8]/60 pb-3">
              <div className="flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-[#141413]" />
                <h3 className="font-gothic text-xs font-bold uppercase tracking-wider text-[#141413]">
                  Platform Broadcasts
                </h3>
              </div>
              <Link
                to="/admin/broadcasts"
                className="font-gothic text-[11px] font-bold uppercase tracking-wider text-[#d97757] hover:underline text-decoration-none"
              >
                Manage
              </Link>
            </div>

            <div className="space-y-3">
              {metrics?.recentBroadcasts && metrics.recentBroadcasts.length > 0 ? (
                metrics.recentBroadcasts.map((b) => (
                  <div
                    key={b.id}
                    className="p-3.5 rounded-xl bg-[#f0eee6] border border-[#cccbc8]/60 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-gothic text-xs font-bold uppercase tracking-tight text-[#141413]">
                        {b.title}
                      </span>
                      <span className="px-2 py-0.2 rounded-full font-gothic text-[9px] font-extrabold uppercase bg-[#faf9f5] border border-[#cccbc8] text-[#87867f]">
                        {b.severity}
                      </span>
                    </div>
                    <p className="font-serif text-xs text-[#141413]/70 line-clamp-2">{b.message}</p>
                  </div>
                ))
              ) : (
                <p className="font-serif text-xs text-[#87867f] py-4 text-center">
                  No active broadcasts dispatched.
                </p>
              )}
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="p-5 rounded-2xl bg-[#141413] text-[#faf9f5] space-y-3">
            <h4 className="font-gothic text-xs font-bold uppercase tracking-wider text-[#d97757]">
              Curated Showcase Promotion
            </h4>
            <p className="font-serif text-xs text-[#faf9f5]/80 leading-relaxed">
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
