import React from "react";
import { Skeleton } from "./Skeleton.tsx";

/**
 * High-performance route loading skeleton.
 * Displays a non-blocking top progress bar and subtle content skeletons
 * preventing screen flashing and layout shifts during route transitions.
 */
export const RouteLoadingSkeleton: React.FC = () => {
  return (
    <div className="w-full min-h-[60vh] relative animate-fade-in">
      {/* Top linear progress indicator */}
      <div className="fixed top-0 left-0 right-0 z-50 h-[3px] bg-stone/30 overflow-hidden">
        <div className="h-full bg-clay animate-indeterminate origin-left" />
      </div>

      {/* Gentle skeleton placeholder */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="space-y-2">
          <Skeleton variant="text" width="25%" height={28} />
          <Skeleton variant="text" width="40%" height={16} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          <Skeleton variant="rectangular" className="w-full h-64 rounded-2xl" />
          <Skeleton variant="rectangular" className="w-full h-64 rounded-2xl" />
          <Skeleton variant="rectangular" className="w-full h-64 rounded-2xl" />
        </div>
      </div>
    </div>
  );
};
