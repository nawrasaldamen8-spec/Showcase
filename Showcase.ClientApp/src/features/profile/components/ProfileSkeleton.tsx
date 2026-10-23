import React from "react";
import { Skeleton } from "@shared/components/Skeleton.tsx";

const SKELETON_ASPECTS = [
  "aspect-[3/4]",
  "aspect-square",
  "aspect-[4/5]",
  "aspect-[4/3]",
  "aspect-[3/4]",
  "aspect-square",
  "aspect-[4/5]",
  "aspect-[4/3]",
];

export const ProfileSkeleton: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 animate-pulse" aria-hidden="true">
      {/* Breadcrumb Skeleton */}
      <Skeleton variant="text" width={110} height={16} className="mb-6 rounded" />

      {/* Profile Header Shell (1:1 with ProfileHeader.tsx) */}
      <div className="bg-ivory-light rounded-2xl sm:rounded-card border border-stone/60 p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 shadow-none">
        <div className="flex items-start justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3.5 sm:gap-6 min-w-0 flex-1 pr-2 sm:pr-4">
            {/* Avatar xl Skeleton */}
            <Skeleton variant="circular" className="w-16 h-16 sm:w-20 sm:h-20 shrink-0" />

            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton variant="text" className="h-6 sm:h-8 w-36 sm:w-56" />
                <Skeleton variant="circular" className="w-4 h-4" />
              </div>
              <Skeleton variant="text" width={90} height={14} />
              <div className="pt-0.5">
                <Skeleton variant="rectangular" width={110} height={22} className="rounded-full" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Skeleton variant="rectangular" width={80} height={36} className="rounded-xl hidden sm:block" />
            <Skeleton variant="circular" width={40} height={40} className="rounded-xl" />
          </div>
        </div>

        {/* Bio Snippet Skeleton */}
        <div className="mt-5 pt-4 border-t border-stone/40 space-y-1.5">
          <Skeleton variant="text" width="75%" height={14} />
          <Skeleton variant="text" width="45%" height={14} />
        </div>
      </div>

      {/* Navigation Tabs Skeleton (Works, Career, About) */}
      <div className="flex items-center gap-6 sm:gap-8 border-b border-stone mb-8 pb-3">
        <Skeleton variant="text" width={64} height={16} />
        <Skeleton variant="text" width={64} height={16} />
        <Skeleton variant="text" width={64} height={16} />
      </div>

      {/* Masonry Post Grid Skeletons */}
      <div className="columns-2 sm:columns-3 lg:columns-4 gap-3.5 sm:gap-4 lg:gap-5 [column-fill:_balance]">
        {SKELETON_ASPECTS.map((aspect, idx) => (
          <div key={idx} className="break-inside-avoid mb-3.5 sm:mb-4 lg:mb-5">
            <div className={`${aspect} bg-[#e6e3da] w-full rounded-xl overflow-hidden shadow-none border border-stone/40`}>
              <Skeleton variant="rectangular" className="w-full h-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
