import React from "react";
import type { StorageTelemetryDto } from "@shared/types/index.ts";

export interface StorageBarChartProps {
  telemetry: StorageTelemetryDto;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export const StorageBarChart: React.FC<StorageBarChartProps> = ({ telemetry }) => {
  const usedPercent = Math.min(
    Math.round((telemetry.usedBytes / (telemetry.totalCapacityBytes || 1)) * 100),
    100
  );

  const imagesPercent = Math.round((telemetry.breakdown.imagesBytes / (telemetry.usedBytes || 1)) * 100) || 85;
  const thumbsPercent = 100 - imagesPercent;

  return (
    <div className="p-6 rounded-2xl bg-ivory-light border border-stone space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone/60 pb-4">
        <div>
          <h3 className="font-gothic text-base font-bold uppercase tracking-tight text-slate-dark">
            Cloudinary Media Storage Telemetry
          </h3>
          <p className="font-serif text-xs text-cloud-dark">
            Real-time media assets distribution, monthly quota allocation, and transformations.
          </p>
        </div>

        <div className="text-left sm:text-right">
          <span className="font-gothic font-extrabold text-xl sm:text-2xl text-slate-dark">
            {formatBytes(telemetry.usedBytes)}
          </span>
          <span className="font-serif text-xs text-cloud-dark block">
            of {formatBytes(telemetry.totalCapacityBytes)} Quota ({usedPercent}% allocated)
          </span>
        </div>
      </div>

      {/* Main Capacity Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-gothic font-bold uppercase tracking-wider text-cloud-dark">
          <span>Capacity Meter</span>
          <span>{100 - usedPercent}% Available Space</span>
        </div>
        <div className="h-4 w-full bg-[#e8e5dc] rounded-full overflow-hidden flex">
          <div
            style={{ width: `${Math.max(usedPercent, 2)}%` }}
            className="h-full bg-slate-dark transition-all duration-500 rounded-full"
          />
        </div>
      </div>

      {/* Storage Breakdown */}
      <div className="space-y-3 pt-2">
        <span className="font-gothic text-[11px] font-bold uppercase tracking-wider text-cloud-dark block">
          Asset Type &amp; Transformation Distribution
        </span>

        <div className="h-3 w-full rounded-full overflow-hidden flex bg-[#e8e5dc]">
          <div
            style={{ width: `${imagesPercent}%` }}
            className="h-full bg-clay"
            title={`High-Resolution Originals: ${imagesPercent}%`}
          />
          <div
            style={{ width: `${thumbsPercent}%` }}
            className="h-full bg-slate-dark/70"
            title={`Optimized Auto-Format Assets: ${thumbsPercent}%`}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2 text-xs font-serif">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-clay shrink-0" />
            <span className="text-slate-dark font-medium">Original Uploads:</span>
            <span className="text-cloud-dark">{formatBytes(telemetry.breakdown.imagesBytes)}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-slate-dark/70 shrink-0" />
            <span className="text-slate-dark font-medium">Optimized Delivery:</span>
            <span className="text-cloud-dark">{formatBytes(telemetry.breakdown.thumbnailsBytes)}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#2e7d32] shrink-0" />
            <span className="text-slate-dark font-medium">Monthly Bandwidth:</span>
            <span className="text-cloud-dark">{formatBytes(telemetry.monthlyBandwidthBytes)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
