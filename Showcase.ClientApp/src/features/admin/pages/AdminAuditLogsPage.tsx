import React, { useState } from "react";
import { Search, Shield } from "lucide-react";
import { Input } from "@shared/components/Input.tsx";
import { useAsyncData } from "@shared/hooks/index.ts";
import { apiClient } from "@shared/api/index.ts";
import { AdminLayout } from "../components/AdminLayout.tsx";

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

  return (
    <AdminLayout
      title="Security &amp; Administrative Audit Log"
      subtitle="Immutable chronological trail of all moderation actions, permissions alterations, and system interventions."
    >
      {/* Search Header */}
      <div className="bg-[#faf9f5] p-4 rounded-2xl border border-[#cccbc8] flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 text-[#87867f] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Search audit trail by admin, target, action..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-[#f0eee6] border-[#cccbc8]"
          />
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-[#faf9f5] rounded-2xl border border-[#cccbc8] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-serif text-xs">
            <thead>
              <tr className="border-b border-[#cccbc8] bg-[#f0eee6] font-gothic text-[10px] font-bold uppercase tracking-[0.14em] text-[#87867f]">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Admin Operator</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Target Entity</th>
                <th className="py-3 px-4">Rationale / Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#cccbc8]/60">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[#87867f]">
                    Loading audit records...
                  </td>
                </tr>
              ) : !filteredLogs || filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[#87867f]">
                    No audit records matching search query.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#f0eee6]/50 transition-colors">
                    <td className="py-3.5 px-4 font-serif text-[#87867f] whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-gothic font-bold uppercase tracking-wider text-[#141413]">
                        <Shield className="w-3.5 h-3.5 text-[#d97757]" />
                        <span>@{log.adminUsername}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full font-gothic text-[9px] font-extrabold uppercase tracking-wider bg-[#e8e5dc] border border-[#cccbc8] text-[#141413]">
                        {log.action.replace(/_/g, " ")}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-gothic font-bold text-[#d97757]">
                      {log.targetLabel}
                    </td>

                    <td className="py-3.5 px-4 font-serif text-[#141413]/80 max-w-xs truncate">
                      {log.reason || "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};
