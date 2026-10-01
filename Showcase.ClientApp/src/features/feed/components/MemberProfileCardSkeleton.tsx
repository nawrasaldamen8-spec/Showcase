import React from "react";
import { Skeleton } from "@shared/components/Skeleton.tsx";

export interface MemberProfileCardSkeletonProps {
  count?: number;
}

export const MemberProfileCardSkeleton: React.FC<MemberProfileCardSkeletonProps> = ({ count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="bg-ivory-light border border-stone rounded-2xl p-5 sm:p-6 space-y-4 animate-pulse shadow-none"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Skeleton variant="circular" width={48} height={48} className="shrink-0" />
              <div className="flex-1 space-y-2 min-w-0">
                <Skeleton variant="text" width="60%" height={16} />
                <Skeleton variant="text" width="40%" height={12} />
              </div>
            </div>
            <Skeleton variant="rectangular" width={64} height={20} className="rounded-full shrink-0" />
          </div>

          <div className="space-y-1.5 py-1">
            <Skeleton variant="text" width="100%" height={14} />
            <Skeleton variant="text" width="85%" height={14} />
          </div>

          <div className="pt-3 border-t border-stone/50">
            <Skeleton variant="rectangular" className="w-full h-10 rounded-xl" />
          </div>
        </div>
      ))}
    </>
  );
};
