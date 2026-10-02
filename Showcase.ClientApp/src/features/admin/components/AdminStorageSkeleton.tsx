import React from "react";
import { Skeleton } from "@shared/components/Skeleton.tsx";

export const AdminStorageSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* 4 KPI Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-5 rounded-2xl bg-ivory-light border border-stone space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton variant="text" width="60%" height={14} />
              <Skeleton variant="circular" width={32} height={32} />
            </div>
            <Skeleton variant="text" width="80%" height={28} />
            <Skeleton variant="text" width="50%" height={12} />
          </div>
        ))}
      </div>

      {/* Bar Chart Skeleton */}
      <div className="p-6 rounded-2xl bg-ivory-light border border-stone space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-stone/60">
          <div className="space-y-2 w-1/3">
            <Skeleton variant="text" width="70%" height={20} />
            <Skeleton variant="text" width="90%" height={14} />
          </div>
          <div className="space-y-1 w-28 text-right">
            <Skeleton variant="text" width="100%" height={24} />
            <Skeleton variant="text" width="70%" height={12} />
          </div>
        </div>
        <Skeleton variant="rectangular" className="w-full h-4 rounded-full" />
        <Skeleton variant="rectangular" className="w-full h-3 rounded-full" />
      </div>

      {/* Top Consumers Table Skeleton */}
      <div className="bg-ivory-light rounded-2xl border border-stone p-5 space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-stone/60">
          <Skeleton variant="text" width={200} height={18} />
          <Skeleton variant="text" width={120} height={14} />
        </div>
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-stone/30">
              <div className="flex items-center gap-3 w-1/3">
                <Skeleton variant="circular" width={28} height={28} />
                <div className="space-y-1 flex-1">
                  <Skeleton variant="text" width="80%" height={14} />
                  <Skeleton variant="text" width="50%" height={11} />
                </div>
              </div>
              <Skeleton variant="text" width={70} height={14} />
              <Skeleton variant="text" width={90} height={14} />
              <Skeleton variant="text" width={110} height={14} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
