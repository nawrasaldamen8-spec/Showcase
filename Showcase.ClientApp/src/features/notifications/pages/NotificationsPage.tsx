import { ArrowLeft, Bell } from "lucide-react";
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { apiClient, queryKeys } from "@shared/api/index.ts";
import { useInfiniteScroll } from "@shared/hooks/index.ts";
import type { NotificationDto } from "@shared/api/apiClient.notifications.ts";
import { NotificationRow } from "../components/NotificationRow.tsx";
import { NotificationRowSkeleton } from "../components/NotificationRowSkeleton.tsx";
import { useInfiniteNotificationsQuery } from "../hooks/useNotificationQueries.ts";

export const NotificationsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteNotificationsQuery(20);

  const notifications = data?.pages.flatMap((page) => page.items) || [];

  const sentinelRef = useInfiniteScroll({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  });

  // Automatically mark unread notifications as seen/read in the background
  useEffect(() => {
    if (notifications.length === 0) return;

    const unreadList = notifications.filter((n) => !n.isRead);
    if (unreadList.length === 0) return;

    unreadList.forEach((n) => {
      apiClient.markNotificationAsRead(n.id).catch(() => {});
    });

    // Update query cache so rows and badges reflect read state without full refetch
    queryClient.setQueriesData({ queryKey: queryKeys.notifications.all }, (oldData: unknown) => {
      if (!oldData || typeof oldData !== "object") return oldData;
      if ("pages" in (oldData as { pages: unknown[] })) {
        const infiniteData = oldData as { pages: { items: NotificationDto[] }[] };
        return {
          ...infiniteData,
          pages: infiniteData.pages.map((p) => ({
            ...p,
            items: p.items.map((item) => ({ ...item, isRead: true })),
          })),
        };
      }
      return oldData;
    });
  }, [notifications, queryClient]);

  return (
    <div className="min-h-[85vh] bg-ivory-medium py-6 sm:py-10 px-4 sm:px-6 lg:px-8 pb-24">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <nav aria-label="Breadcrumb navigation">
          <Link
            to="/studio"
            className="inline-flex items-center gap-2 font-gothic text-xs font-semibold uppercase tracking-[0.14em] text-cloud-dark hover:text-slate-dark transition-colors group text-decoration-none"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span>Studio</span>
          </Link>
        </nav>

        {/* Minimalist Page Header */}
        <header className="border-b border-stone/50 pb-4">
          <h1 className="font-gothic font-extrabold text-2xl sm:text-3xl uppercase tracking-tight text-slate-dark">
            Notifications
          </h1>
        </header>

        {/* Unified Activity Feed Rows */}
        <div className="bg-ivory-light/40 border border-stone/50 rounded-2xl p-2 sm:p-3 divide-y divide-stone/30">
          {isLoading ? (
            <NotificationRowSkeleton count={5} />
          ) : notifications.length === 0 ? (
            <div className="py-14 text-center space-y-2">
              <Bell className="w-7 h-7 text-cloud-dark/40 mx-auto" />
              <h2 className="font-gothic text-xs font-bold uppercase tracking-wider text-slate-dark">
                No notifications yet
              </h2>
              <p className="font-serif text-xs text-cloud-dark">
                New likes, profile visits, and updates will appear here.
              </p>
            </div>
          ) : (
            <>
              {notifications.map((notification) => (
                <NotificationRow
                  key={notification.id}
                  notification={notification}
                />
              ))}

              {/* Infinite Scroll Sentinel & Subtle Bottom Loading Indicator */}
              <div ref={sentinelRef} className="pt-2">
                {isFetchingNextPage && (
                  <div className="py-3">
                    <NotificationRowSkeleton count={2} />
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
