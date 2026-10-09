import React from "react";
import { Activity, Database, FileText, HardDrive, RefreshCw, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiClient, queryKeys } from "@shared/api/index.ts";
import { formatBytes } from "@shared/utils/format.ts";
import { Button } from "@shared/components/Button.tsx";
import { UserAvatar } from "@shared/components/media/index.ts";
import { AdminKpiCard } from "../components/AdminKpiCard.tsx";
import { AdminLayout } from "../components/AdminLayout.tsx";
import { StorageBarChart } from "../components/StorageBarChart.tsx";
import { AdminStorageSkeleton } from "../components/AdminStorageSkeleton.tsx";

export const AdminStoragePage: React.FC = () => {
  const {
    data: telemetry,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: queryKeys.admin.storage(),
    queryFn: () => apiClient.getStorageTelemetry(),
    staleTime: 1000 * 60 * 3, // 3 minutes cache
  });

  return (
    <AdminLayout
      title="Cloudinary Media Storage &amp; CDN Telemetry"
      subtitle="Monitor live media assets distribution, transformations, and bandwidth quotas."
    >
      {/* Top Header Controls */}
      <div className="flex justify-between items-center pb-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 font-gothic text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            Live Cloudinary API
          </span>
          <span className="font-serif text-xs text-cloud-dark hidden sm:inline">
            Plan: <strong className="text-slate-dark">{telemetry?.planName || "Free Tier"}</strong>
          </span>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isLoading || isRefetching}
          leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? "animate-spin" : ""}`} />}
        >
          {isRefetching ? "Refreshing..." : "Refresh Telemetry"}
        </Button>
      </div>

      {isLoading ? (
        <AdminStorageSkeleton />
      ) : telemetry ? (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <AdminKpiCard
              title="Total Media Assets"
              value={telemetry.totalFilesCount.toLocaleString()}
              subtitle="Cloudinary images &amp; media"
              icon={HardDrive}
            />

            <AdminKpiCard
              title="Storage Consumption"
              value={formatBytes(telemetry.usedBytes)}
              subtitle={`of ${formatBytes(telemetry.totalCapacityBytes)} quota`}
              icon={Database}
            />

            <AdminKpiCard
              title="Monthly Bandwidth"
              value={formatBytes(telemetry.monthlyBandwidthBytes)}
              subtitle="CDN delivery traffic"
              icon={Activity}
            />

            <AdminKpiCard
              title="Transformations"
              value={telemetry.requestsCount > 0 ? telemetry.requestsCount.toLocaleString() : "Auto f,q"}
              subtitle="Smart WebP/AVIF format"
              icon={Sparkles}
              badge="Optimized"
              badgeVariant="success"
            />
          </div>

          {/* Main Visual Chart */}
          <StorageBarChart telemetry={telemetry} />

          {/* Top Storage Consumers Table */}
          <div className="bg-ivory-light rounded-2xl border border-stone overflow-hidden space-y-3 p-5 shadow-none">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone/60 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-clay" />
                <h3 className="font-gothic text-xs font-bold uppercase tracking-wider text-slate-dark">
                  Top Storage Consuming Portfolios
                </h3>
              </div>
              <span className="font-serif text-xs text-cloud-dark">
                Ranked by creator project assets footprint
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-serif text-xs">
                <thead>
                  <tr className="border-b border-stone text-[10px] font-gothic font-bold uppercase tracking-wider text-cloud-dark">
                    <th className="py-2.5 px-3">Creator</th>
                    <th className="py-2.5 px-3">Stored Assets</th>
                    <th className="py-2.5 px-3">Footprint</th>
                    <th className="py-2.5 px-3 text-right">Consumption Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone/50">
                  {telemetry.topConsumers && telemetry.topConsumers.length > 0 ? (
                    telemetry.topConsumers.map((consumer, idx) => {
                      const percentOfTotal = telemetry.usedBytes > 0
                        ? Math.min(Math.round((consumer.bytesUsed / telemetry.usedBytes) * 100), 100)
                        : 0;

                      return (
                        <tr key={consumer.userId} className="hover:bg-ivory-medium/50 transition-colors">
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2.5">
                              <span className="font-gothic font-bold text-xs text-cloud-dark w-5">
                                #{idx + 1}
                              </span>
                              <UserAvatar
                                src={consumer.avatarUrl}
                                alt={consumer.fullName || consumer.username}
                                size="xs"
                                className="w-7 h-7 border border-stone shrink-0"
                              />
                              <div className="min-w-0">
                                <span className="font-gothic font-bold uppercase tracking-wider text-slate-dark block truncate">
                                  {consumer.fullName}
                                </span>
                                <span className="text-cloud-dark block text-[11px] truncate">
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
                              {percentOfTotal > 0 ? `${percentOfTotal}% of used space` : "Active"}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-cloud-dark">
                        No portfolio assets uploaded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </AdminLayout>
  );
};
