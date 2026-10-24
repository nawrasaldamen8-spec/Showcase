import React from "react";
import { Skeleton } from "@shared/components/Skeleton.tsx";

export const PostDetailSkeleton: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-10 animate-pulse" aria-hidden="true">
      {/* Back Navigation Breadcrumb Skeleton */}
      <div className="mb-8 sm:mb-10 flex items-center justify-between">
        <Skeleton variant="text" width={110} height={16} className="rounded" />
      </div>

      {/* Desktop Responsive Layout (lg: 1024px and up, matches PostDetailDesktop) */}
      <div className="hidden lg:block space-y-12 lg:space-y-16">
        <div className="grid grid-cols-12 gap-8 lg:gap-12 xl:gap-16 items-start">
          {/* Main Primary Image Canvas */}
          <div className="col-span-12 lg:col-span-7">
            <Skeleton variant="rectangular" className="w-full h-[55vh] max-h-[600px] rounded-card" />
          </div>

          {/* Curatorial Meta Details Sidebar */}
          <div className="col-span-12 lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            {/* Creator Identity */}
            <div className="flex items-center gap-3.5">
              <Skeleton variant="circular" width={48} height={48} />
              <div className="space-y-1.5 flex-1 min-w-0">
                <Skeleton variant="text" width="60%" height={18} />
                <Skeleton variant="text" width="35%" height={14} />
              </div>
            </div>

            {/* Title */}
            <Skeleton variant="text" width="85%" height={36} />

            {/* Action Buttons Row */}
            <div className="flex gap-3">
              <Skeleton variant="rectangular" width={96} height={36} className="rounded-full" />
              <Skeleton variant="rectangular" width={96} height={36} className="rounded-full" />
            </div>

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
          </div>
        </div>

        {/* Secondary Plates Grid */}
        <div className="pt-8 border-t border-stone/50 grid grid-cols-12 gap-6 lg:gap-8">
          <div className="col-span-12 md:col-span-6">
            <Skeleton variant="rectangular" className="w-full h-72 rounded-card" />
          </div>
          <div className="col-span-12 md:col-span-6">
            <Skeleton variant="rectangular" className="w-full h-72 rounded-card" />
          </div>
        </div>
      </div>

      {/* Mobile Responsive Layout (below lg: 1024px, matches PostDetailMobile) */}
      <div className="block lg:hidden space-y-5 max-w-3xl mx-auto">
        {/* Creator Header Row */}
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-2.5 min-w-0">
            <Skeleton variant="circular" width={40} height={40} />
            <div className="space-y-1">
              <Skeleton variant="text" width={110} height={16} />
              <Skeleton variant="text" width={80} height={12} />
            </div>
          </div>
          <Skeleton variant="text" width={80} height={14} className="rounded" />
        </div>

        {/* Adaptive Image Container with Pagination Badge */}
        <div className="relative w-full h-[380px] sm:h-[480px] rounded-2xl bg-[#e6e3da] overflow-hidden border border-stone/60 flex items-center justify-center">
          <div className="absolute top-3 right-3 w-14 h-6 rounded-full bg-slate-dark/20" />
        </div>

        {/* Dots */}
        <div className="flex items-center justify-center gap-1.5 py-1">
          <div className="w-4 h-1.5 rounded-full bg-slate-dark/40" />
          <div className="w-1.5 h-1.5 rounded-full bg-stone" />
          <div className="w-1.5 h-1.5 rounded-full bg-stone" />
        </div>

        {/* Curatorial Details (Inline) */}
        <div className="space-y-4 pt-1 px-1">
          <Skeleton variant="text" width="85%" height={28} />
          <Skeleton variant="text" width="35%" height={14} />

          {/* Action Buttons */}
          <div className="flex gap-3 pt-1">
            <Skeleton variant="rectangular" width={90} height={36} className="rounded-full" />
            <Skeleton variant="rectangular" width={90} height={36} className="rounded-full" />
          </div>

          {/* Tags */}
          <div className="flex gap-2">
            <Skeleton variant="rectangular" width={64} height={22} className="rounded-full" />
            <Skeleton variant="rectangular" width={72} height={22} className="rounded-full" />
          </div>

          {/* Description */}
          <div className="space-y-2 pt-1">
            <Skeleton variant="text" width="100%" height={15} />
            <Skeleton variant="text" width="92%" height={15} />
            <Skeleton variant="text" width="70%" height={15} />
          </div>
        </div>
      </div>
    </div>
  );
};
