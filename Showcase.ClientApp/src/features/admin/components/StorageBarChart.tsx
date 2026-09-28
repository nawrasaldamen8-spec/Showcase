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
    Math.round((telemetry.usedBytes / telemetry.totalCapacityBytes) * 100),
    100
  );

  const imagesPercent = Math.round((telemetry.breakdown.imagesBytes / telemetry.usedBytes) * 100) || 0;
  const docsPercent = Math.round((telemetry.breakdown.documentsBytes / telemetry.usedBytes) * 100) || 0;
  const thumbsPercent = 100 - imagesPercent - docsPercent;

  return (
    <div className="p-6 rounded-2xl bg-ivory-light border border-stone space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone/60 pb-4">
        <div>
          <h3 className="font-gothic text-base font-bold uppercase tracking-tight text-slate-dark">
            Cloudflare R2 Bucket Telemetry
          </h3>
          <p className="font-serif text-xs text-cloud-dark">
            Real-time storage distribution, capacity quotas, and bandwidth.
          </p>
        </div>

        <div className="text-right">
          <span className="font-gothic font-extrabold text-xl sm:text-2xl text-slate-dark">
            {formatBytes(telemetry.usedBytes)}
          </span>
          <span className="font-serif text-xs text-cloud-dark block">
            of {formatBytes(telemetry.totalCapacityBytes)} Quota ({usedPercent}% used)
          </span>
        </div>
      </div>

      {/* Main Capacity Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-gothic font-bold uppercase tracking-wider text-cloud-dark">
          <span>Allocation Meter</span>
          <span>{100 - usedPercent}% Free Space Remaining</span>
        </div>
        <div className="h-4 w-full bg-[#e8e5dc] rounded-full overflow-hidden flex">
          <div
            style={{ width: `${usedPercent}%` }}
            className="h-full bg-slate-dark transition-all duration-500 rounded-full"
          />
        </div>
      </div>

      {/* Storage Breakdown */}
      <div className="space-y-3 pt-2">
        <span className="font-gothic text-[11px] font-bold uppercase tracking-wider text-cloud-dark block">
          Asset Type Breakdown
        </span>

        <div className="h-3 w-full rounded-full overflow-hidden flex bg-[#e8e5dc]">
          <div
            style={{ width: `${imagesPercent}%` }}
            className="h-full bg-clay"
            title={`Images: ${imagesPercent}%`}
          />
          <div
            style={{ width: `${docsPercent}%` }}
            className="h-full bg-[#2e7d32]"
            title={`Documents: ${docsPercent}%`}
          />
          <div
            style={{ width: `${thumbsPercent}%` }}
            className="h-full bg-cloud-dark"
            title={`Thumbnails: ${thumbsPercent}%`}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-serif">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-clay" />
            <span className="text-slate-dark font-medium">Original Images:</span>
            <span className="text-cloud-dark">{formatBytes(telemetry.breakdown.imagesBytes)}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#2e7d32]" />
            <span className="text-slate-dark font-medium">PDF Documents:</span>
            <span className="text-cloud-dark">{formatBytes(telemetry.breakdown.documentsBytes)}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-cloud-dark" />
            <span className="text-slate-dark font-medium">Thumbnails / Cache:</span>
            <span className="text-cloud-dark">{formatBytes(telemetry.breakdown.thumbnailsBytes)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
