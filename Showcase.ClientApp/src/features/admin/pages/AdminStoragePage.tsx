import React from "react";
import { Activity, Database, FileText, HardDrive, Server } from "lucide-react";
import { useAsyncData } from "@shared/hooks/index.ts";
import { apiClient } from "@shared/api/index.ts";
import { formatBytes } from "@shared/utils/format.ts";
import { AdminKpiCard } from "../components/AdminKpiCard.tsx";
import { AdminLayout } from "../components/AdminLayout.tsx";
import { StorageBarChart } from "../components/StorageBarChart.tsx";

export const AdminStoragePage: React.FC = () => {
  const { data: telemetry } = useAsyncData(() => apiClient.getStorageTelemetry());

  return (
    <AdminLayout
      title="Cloudflare R2 Storage &amp; CDN Telemetry"
      subtitle="Monitor object store allocation, media assets throughput, and account consumption limits."
    >
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminKpiCard
          title="Total Objects"
          value={telemetry ? telemetry.totalFilesCount.toLocaleString() : "—"}
          subtitle="Original photos &amp; files"
          icon={HardDrive}
        />

        <AdminKpiCard
          title="Monthly Bandwidth"
          value={telemetry ? formatBytes(telemetry.monthlyBandwidthBytes) : "—"}
          subtitle="CDN egress transfer"
          icon={Activity}
        />

        <AdminKpiCard
          title="Egress Requests"
          value={telemetry ? `${(telemetry.requestsCount / 1000).toFixed(1)}k` : "—"}
          subtitle="Cache hits &amp; reads"
          icon={Server}
        />

        <AdminKpiCard
          title="Bucket Health"
          value="99.99%"
          subtitle="Operational across all POPs"
          icon={Database}
          badge="Healthy"
          badgeVariant="success"
        />
      </div>

      {/* Main Visual Chart */}
      {telemetry && <StorageBarChart telemetry={telemetry} />}

      {/* Top Storage Consumers Table */}
      <div className="bg-ivory-light rounded-2xl border border-stone overflow-hidden space-y-3 p-5">
        <div className="flex items-center justify-between border-b border-stone/60 pb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-clay" />
            <h3 className="font-gothic text-xs font-bold uppercase tracking-wider text-slate-dark">
              Top Storage Consuming Portfolios
            </h3>
          </div>
          <span className="font-serif text-xs text-cloud-dark">Ranked by R2 disk footprint</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-serif text-xs">
            <thead>
              <tr className="border-b border-stone text-[10px] font-gothic font-bold uppercase tracking-wider text-cloud-dark">
                <th className="py-2.5 px-3">Creator</th>
                <th className="py-2.5 px-3">Files Stored</th>
                <th className="py-2.5 px-3">Total Footprint</th>
                <th className="py-2.5 px-3 text-right">Quota Utilization</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone/50">
              {telemetry?.topConsumers.map((consumer, idx) => {
                const percentOfTotal = Math.round(
                  (consumer.bytesUsed / telemetry.usedBytes) * 100
                );

                return (
                  <tr key={consumer.userId} className="hover:bg-ivory-medium/50">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <span className="font-gothic font-bold text-xs text-cloud-dark">
                          #{idx + 1}
                        </span>
                        {consumer.avatarUrl ? (
                          <img
                            src={consumer.avatarUrl}
                            alt={consumer.username}
                            className="w-7 h-7 rounded-full object-cover border border-stone"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-slate-dark text-ivory-light flex items-center justify-center font-gothic text-xs font-bold uppercase">
                            {consumer.fullName[0]}
                          </div>
                        )}
                        <div>
                          <span className="font-gothic font-bold uppercase tracking-wider text-slate-dark">
                            {consumer.fullName}
                          </span>
                          <span className="text-cloud-dark block text-[11px]">
                            @{consumer.username}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 font-gothic font-bold text-slate-dark">
                      {consumer.filesCount} assets
                    </td>

                    <td className="py-3 px-3 font-medium text-slate-dark">
                      {formatBytes(consumer.bytesUsed)}
                    </td>

                    <td className="py-3 px-3 text-right">
                      <span className="font-gothic text-[11px] font-bold text-clay">
                        {percentOfTotal}% of used space
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};
