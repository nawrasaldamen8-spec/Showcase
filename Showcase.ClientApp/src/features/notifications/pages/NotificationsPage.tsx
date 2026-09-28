import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  CheckCheck,
  Megaphone,
} from "lucide-react";
import { Button } from "@shared/components/Button.tsx";
import { useAsyncData } from "@shared/hooks/index.ts";
import { apiClient } from "@shared/api/index.ts";
import { NotificationCard, type NotificationCardItem } from "../components/NotificationCard.tsx";

const NOTIFICATIONS_STORAGE_KEY = "showcase_read_notifications";

export const NotificationsPage: React.FC = () => {
  const [readIds, setReadIds] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      return stored ? new Set(JSON.parse(stored) as string[]) : new Set<string>();
    } catch {
      return new Set<string>();
    }
  });

  const [filter, setFilter] = useState<"all" | "announcements" | "warnings">("all");

  const { data: broadcasts, isLoading } = useAsyncData(() => apiClient.getBroadcasts());

  // Map broadcasts into standard notification items
  const notifications: NotificationCardItem[] = useMemo(() => {
    if (!broadcasts) return [];

    return broadcasts.map((b) => {
      const isWarning = b.severity === "warning";
      return {
        id: b.id,
        title: b.title,
        message: b.message,
        category: isWarning ? ("System Warning" as const) : ("Announcement" as const),
        timestamp: b.publishedAt,
        isRead: readIds.has(b.id),
      };
    });
  }, [broadcasts, readIds]);

  const handleMarkAsRead = (id: string) => {
    setReadIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      try {
        localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify([...next]));
      } catch {
        // Ignore storage errors
      }
      return next;
    });
  };

  const handleMarkAllAsRead = () => {
    const allIds = new Set(notifications.map((n) => n.id));
    setReadIds(allIds);
    try {
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify([...allIds]));
    } catch {
      // Ignore storage errors
    }
  };

  const filteredNotifications = notifications.filter((item) => {
    if (filter === "announcements") return item.category === "Announcement";
    if (filter === "warnings") return item.category === "System Warning";
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="min-h-[80vh] bg-ivory-medium py-8 sm:py-12 px-4 sm:px-6 lg:px-8 pb-24">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <nav aria-label="Breadcrumb navigation">
          <Link
            to="/studio"
            className="inline-flex items-center gap-2 font-gothic text-xs font-semibold uppercase tracking-[0.14em] text-cloud-dark hover:text-slate-dark transition-colors group text-decoration-none"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span>Creator Studio</span>
          </Link>
        </nav>

        {/* Page Header */}
        <header className="border-b border-stone pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="font-gothic text-xs font-bold uppercase tracking-[0.16em] text-clay">
                System Notices
              </span>
              <span className="text-stone">&bull;</span>
              <span className="font-gothic text-xs font-semibold uppercase tracking-[0.10em] text-cloud-dark">
                {unreadCount > 0 ? `${unreadCount} Unread` : "All Caught Up"}
              </span>
            </div>

            <h1 className="font-gothic font-extrabold text-3xl sm:text-4xl uppercase tracking-tight text-slate-dark">
              Notifications
            </h1>

            <p className="font-serif text-sm text-slate-dark/75">
              Official platform announcements and system warnings regarding your account.
            </p>
          </div>

          {notifications.length > 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
              leftIcon={<CheckCheck className="w-4 h-4" />}
              className="font-gothic uppercase tracking-wider text-xs self-start sm:self-auto"
            >
              Mark All as Read
            </Button>
          )}
        </header>

        {/* Category Filter Tabs */}
        <div className="bg-ivory-light p-2 rounded-2xl border border-stone flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-xl font-gothic text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
              filter === "all"
                ? "bg-slate-dark text-ivory-light"
                : "text-cloud-dark hover:text-slate-dark hover:bg-[#e8e5dc]/60"
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("announcements")}
            className={`px-3 py-1.5 rounded-xl font-gothic text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
              filter === "announcements"
                ? "bg-slate-dark text-ivory-light"
                : "text-cloud-dark hover:text-slate-dark hover:bg-[#e8e5dc]/60"
            }`}
          >
            Announcements
          </button>
          <button
            type="button"
            onClick={() => setFilter("warnings")}
            className={`px-3 py-1.5 rounded-xl font-gothic text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
              filter === "warnings"
                ? "bg-slate-dark text-ivory-light"
                : "text-cloud-dark hover:text-slate-dark hover:bg-[#e8e5dc]/60"
            }`}
          >
            System Warnings
          </button>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="p-10 bg-ivory-light rounded-2xl border border-stone text-center font-serif text-xs text-cloud-dark">
              Loading system notifications...
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-10 bg-ivory-light rounded-2xl border border-stone text-center space-y-2">
              <Megaphone className="w-8 h-8 text-cloud-dark mx-auto opacity-50" />
              <h3 className="font-gothic text-sm font-bold uppercase tracking-wider text-slate-dark">
                No Notifications Found
              </h3>
              <p className="font-serif text-xs text-cloud-dark">
                You have no active system notifications in this category.
              </p>
            </div>
          ) : (
            filteredNotifications.map((item) => (
              <NotificationCard
                key={item.id}
                item={item}
                onMarkAsRead={handleMarkAsRead}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};
