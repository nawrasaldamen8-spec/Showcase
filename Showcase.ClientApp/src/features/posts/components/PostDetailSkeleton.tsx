import React from "react";
import { Skeleton } from "@shared/components/Skeleton.tsx";

export const PostDetailSkeleton: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 animate-pulse" aria-hidden="true">
      {/* Breadcrumb Skeleton */}
      <Skeleton variant="text" width={110} height={16} className="mb-6 rounded" />

      {/* Desktop Responsive Layout (md and up) */}
      <div className="hidden md:block">
        <div className="grid grid-cols-12 gap-8 lg:gap-12 xl:gap-16 items-start">
          {/* Main Primary Image Canvas */}
          <div className="col-span-7">
            <Skeleton variant="rectangular" className="w-full h-[55vh] max-h-[600px] rounded-card" />
          </div>

          {/* Curatorial Meta Details */}
          <div className="col-span-5 space-y-6">
            {/* Creator Identity */}
            <div className="flex items-center gap-3">
              <Skeleton variant="circular" width={44} height={44} />
              <div className="space-y-1.5 flex-1">
                <Skeleton variant="text" width="60%" height={16} />
                <Skeleton variant="text" width="40%" height={14} />
              </div>
            </div>

            {/* Title */}
            <Skeleton variant="text" width="85%" height={36} />

            {/* Tags */}
            <div className="flex gap-2">
              <Skeleton variant="rectangular" width={70} height={24} className="rounded-full" />
              <Skeleton variant="rectangular" width={80} height={24} className="rounded-full" />
            </div>

            {/* Description Paragraphs */}
            <div className="space-y-2 py-1">
              <Skeleton variant="text" width="100%" height={16} />
              <Skeleton variant="text" width="90%" height={16} />
              <Skeleton variant="text" width="75%" height={16} />
            </div>

            {/* Share / Action Button */}
            <Skeleton variant="rectangular" width={140} height={40} className="rounded-full mt-4" />
          </div>
        </div>

        {/* Secondary / Related Projects Grid */}
        <div className="mt-12 pt-10 border-t border-stone/50 grid grid-cols-2 gap-6 lg:gap-8">
          <Skeleton variant="rectangular" className="w-full h-64 rounded-card" />
          <Skeleton variant="rectangular" className="w-full h-64 rounded-card" />
        </div>
      </div>

      {/* Mobile Responsive Layout (below md, matches PostDetailMobile) */}
      <div className="block md:hidden space-y-4">
        {/* Mobile Header: Creator bar */}
        <div className="flex items-center justify-between pb-2 border-b border-stone/50">
          <div className="flex items-center gap-3">
            <Skeleton variant="circular" width={40} height={40} />
            <div className="space-y-1">
              <Skeleton variant="text" width={100} height={15} />
              <Skeleton variant="text" width={70} height={12} />
            </div>
          </div>
          <Skeleton variant="rectangular" width={76} height={28} className="rounded-full" />
        </div>

        {/* Dynamic Image Canvas with Badge Placeholder */}
        <div className="relative w-full h-[360px] rounded-2xl bg-[#e6e3da] overflow-hidden border border-stone/60">
          <div className="absolute top-3 right-3 w-12 h-5 rounded-full bg-[#d8d3c5]" />
        </div>

        {/* Dots */}
        <div className="flex items-center justify-center gap-1.5 py-1">
          <div className="w-4 h-1.5 rounded-full bg-slate-dark/30" />
          <div className="w-1.5 h-1.5 rounded-full bg-stone" />
          <div className="w-1.5 h-1.5 rounded-full bg-stone" />
        </div>

        {/* Metadata Details below image */}
        <div className="space-y-3 pt-2">
          <Skeleton variant="text" width="80%" height={26} />
          <div className="flex gap-2">
            <Skeleton variant="rectangular" width={64} height={22} className="rounded-full" />
            <Skeleton variant="rectangular" width={72} height={22} className="rounded-full" />
          </div>
          <div className="space-y-1.5 pt-1">
            <Skeleton variant="text" width="100%" height={14} />
            <Skeleton variant="text" width="90%" height={14} />
          </div>
        </div>
      </div>
    </div>
  );
};
