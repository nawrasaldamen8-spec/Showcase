import React, { useState } from "react";
import { Search, Shield } from "lucide-react";
import { Input } from "@shared/components/Input.tsx";
import { useAsyncData } from "@shared/hooks/index.ts";
import { apiClient } from "@shared/api/index.ts";
import type { AuditLogItem } from "@shared/types/index.ts";
import { AdminLayout } from "../components/AdminLayout.tsx";
import { AdminTable, type AdminTableColumn } from "../components/AdminTable.tsx";

export const AdminAuditLogsPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const { data: logs, isLoading } = useAsyncData(() => apiClient.getAuditLogs());

  const filteredLogs = logs?.filter((log) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      log.action.toLowerCase().includes(q) ||
      log.adminUsername.toLowerCase().includes(q) ||
      log.targetLabel.toLowerCase().includes(q) ||
      (log.reason && log.reason.toLowerCase().includes(q))
    );
  });

  const columns: AdminTableColumn<AuditLogItem>[] = [
    {
      key: "timestamp",
      header: "Timestamp",
      className: "font-serif text-cloud-dark whitespace-nowrap",
      render: (log) => new Date(log.timestamp).toLocaleString(),
    },
    {
      key: "admin",
      header: "Admin Operator",
      render: (log) => (
        <div className="flex items-center gap-1.5 font-gothic font-bold uppercase tracking-wider text-slate-dark">
          <Shield className="w-3.5 h-3.5 text-clay" />
          <span>@{log.adminUsername}</span>
        </div>
      ),
    },
    {
      key: "action",
      header: "Action",
      render: (log) => (
        <span className="px-2 py-0.5 rounded-full font-gothic text-[9px] font-extrabold uppercase tracking-wider bg-[#e8e5dc] border border-stone text-slate-dark">
          {log.action.replace(/_/g, " ")}
        </span>
      ),
    },
    {
      key: "target",
      header: "Target Entity",
      className: "font-gothic font-bold text-clay",
      render: (log) => log.targetLabel,
    },
    {
      key: "reason",
      header: "Rationale / Detail",
      className: "font-serif text-slate-dark/80 max-w-xs truncate",
      render: (log) => log.reason || "—",
    },
  ];

  return (
    <AdminLayout
      title="Security &amp; Administrative Audit Log"
      subtitle="Immutable chronological trail of all moderation actions, permissions alterations, and system interventions."
    >
      {/* Search Header */}
      <div className="bg-ivory-light p-4 rounded-2xl border border-stone flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 text-cloud-dark absolute left-3.5 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Search audit trail by admin, target, action..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-ivory-medium border-stone"
          />
        </div>
      </div>

      {/* Audit Log Table */}
      <AdminTable<AuditLogItem>
        columns={columns}
        rows={filteredLogs || []}
        isLoading={isLoading}
        loadingMessage="Loading audit records..."
        emptyMessage="No audit records matching search query."
      />
    </AdminLayout>
  );
};
