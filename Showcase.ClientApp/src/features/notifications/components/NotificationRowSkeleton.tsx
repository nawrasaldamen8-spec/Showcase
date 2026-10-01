import React from "react";
import { Skeleton } from "@shared/components/Skeleton.tsx";

export interface NotificationRowSkeletonProps {
  count?: number;
}

export const NotificationRowSkeleton: React.FC<NotificationRowSkeletonProps> = ({
  count = 4,
}) => {
  return (
    <div className="space-y-1.5 w-full">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="w-full flex items-center justify-between gap-3 sm:gap-4 py-3.5 px-3 sm:px-4 rounded-xl border-b border-stone/20 bg-ivory-light/40"
        >
          {/* Left: Avatar skeleton + Text skeleton */}
          <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 flex-1">
            {/* Unread dot placeholder */}
            <div className="w-2 shrink-0" />

            {/* Circular Avatar */}
            <Skeleton variant="circular" className="w-10 h-10 shrink-0" />

            {/* Text lines */}
            <div className="min-w-0 flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-48 max-w-[70%]" />
              <Skeleton className="h-3 w-32 max-w-[40%]" />
            </div>
          </div>

          {/* Right: Timestamp or thumbnail placeholder */}
          <Skeleton className="h-3 w-12 shrink-0" />
        </div>
      ))}
    </div>
  );
};
