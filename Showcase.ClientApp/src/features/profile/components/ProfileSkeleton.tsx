import React from "react";
import { Skeleton } from "@shared/components/Skeleton.tsx";

const SKELETON_ASPECTS = [
  "aspect-[3/4]",
  "aspect-square",
  "aspect-[4/3]",
  "aspect-[3/4]",
  "aspect-square",
  "aspect-[4/5]",
  "aspect-[4/3]",
  "aspect-[3/4]",
];

export const ProfileSkeleton: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 animate-pulse">
      <Skeleton variant="text" width={140} height={18} className="mb-6" />
      <div className="bg-[#faf9f5] rounded-[24px] border border-[#cccbc8]/50 p-6 sm:p-8 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4 sm:gap-6">
            <Skeleton variant="circular" width={72} height={72} />
            <div className="space-y-2">
              <Skeleton variant="text" width={90} height={14} />
              <Skeleton variant="text" width={160} height={28} />
            </div>
          </div>
          <div className="flex gap-2.5">
            <Skeleton variant="rectangular" width={90} height={36} className="rounded-full" />
            <Skeleton variant="rectangular" width={80} height={36} className="rounded-full" />
          </div>
        </div>
      </div>
      <div className="flex gap-6 border-b border-[#cccbc8] pb-3 mb-8">
        <Skeleton variant="text" width={60} height={18} />
        <Skeleton variant="text" width={60} height={18} />
      </div>
      <div className="columns-2 sm:columns-3 lg:columns-4 gap-3.5 sm:gap-4 lg:gap-5 [column-fill:_balance]">
        {SKELETON_ASPECTS.map((aspect, idx) => (
          <div key={idx} className="break-inside-avoid mb-3.5 sm:mb-4 lg:mb-5">
            <div className={`${aspect} bg-[#e6e3da] w-full overflow-hidden`}>
              <Skeleton variant="rectangular" className="w-full h-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
