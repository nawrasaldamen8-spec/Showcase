import React from "react";
import { Skeleton } from "@shared/components/Skeleton.tsx";

export interface PostCardSkeletonProps {
  count?: number;
  layout?: "grid" | "masonry";
}

export const PostCardSkeleton: React.FC<PostCardSkeletonProps> = ({
  count = 6,
}) => {
  const aspectRatios = ["aspect-[4/3]", "aspect-[3/4]", "aspect-[16/10]", "aspect-[1/1]"];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 w-full">
      {Array.from({ length: count }).map((_, idx) => {
        const aspect = aspectRatios[idx % aspectRatios.length];
        return (
          <div
            key={idx}
            className="rounded-2xl border border-stone/50 bg-ivory-light/60 p-3 space-y-3.5 flex flex-col justify-between"
          >
            {/* Image plate placeholder */}
            <Skeleton
              variant="rectangular"
              className={`w-full rounded-xl ${aspect}`}
            />

            {/* Title & Metadata placeholder */}
            <div className="space-y-2 pt-1">
              <Skeleton className="h-4 w-3/4" />
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <Skeleton variant="circular" className="w-5 h-5" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-3 w-10" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
