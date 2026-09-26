import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCheck,
  Megaphone,
} from "lucide-react";
import { Button } from "@shared/components/Button.tsx";
import { useAsyncData } from "@shared/hooks/index.ts";
import { apiClient } from "@shared/api/index.ts";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  category: "Announcement" | "System Warning";
  timestamp: string;
  isRead: boolean;
}

export const NotificationsPage: React.FC = () => {
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<"all" | "announcements" | "warnings">("all");

  const { data: broadcasts, isLoading } = useAsyncData(() => apiClient.getBroadcasts());

  // Map broadcasts and direct system messages into standard notification items
  const notifications: NotificationItem[] = React.useMemo(() => {
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
      return next;
    });
  };

  const handleMarkAllAsRead = () => {
    const allIds = new Set(notifications.map((n) => n.id));
    setReadIds(allIds);
  };

  const filteredNotifications = notifications.filter((item) => {
    if (filter === "announcements") return item.category === "Announcement";
    if (filter === "warnings") return item.category === "System Warning";
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="min-h-[80vh] bg-[#f0eee6] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 pb-24">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <nav aria-label="Breadcrumb navigation">
          <Link
            to="/studio"
            className="inline-flex items-center gap-2 font-gothic text-xs font-semibold uppercase tracking-[0.14em] text-[#87867f] hover:text-[#141413] transition-colors group text-decoration-none"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span>Creator Studio</span>
          </Link>
        </nav>

        {/* Page Header */}
        <header className="border-b border-[#cccbc8] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="font-gothic text-xs font-bold uppercase tracking-[0.16em] text-[#d97757]">
                System Notices
              </span>
              <span className="text-[#cccbc8]">&bull;</span>
              <span className="font-gothic text-xs font-semibold uppercase tracking-[0.10em] text-[#87867f]">
                {unreadCount > 0 ? `${unreadCount} Unread` : "All Caught Up"}
              </span>
            </div>

            <h1 className="font-gothic font-extrabold text-3xl sm:text-4xl uppercase tracking-tight text-[#141413]">
              Notifications
            </h1>

            <p className="font-serif text-sm text-[#141413]/75">
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
        <div className="bg-[#faf9f5] p-2 rounded-2xl border border-[#cccbc8] flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-xl font-gothic text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
              filter === "all"
                ? "bg-[#141413] text-[#faf9f5]"
                : "text-[#87867f] hover:text-[#141413] hover:bg-[#e8e5dc]/60"
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("announcements")}
            className={`px-3 py-1.5 rounded-xl font-gothic text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
              filter === "announcements"
                ? "bg-[#141413] text-[#faf9f5]"
                : "text-[#87867f] hover:text-[#141413] hover:bg-[#e8e5dc]/60"
            }`}
          >
            Announcements
          </button>
          <button
            type="button"
            onClick={() => setFilter("warnings")}
            className={`px-3 py-1.5 rounded-xl font-gothic text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
              filter === "warnings"
                ? "bg-[#141413] text-[#faf9f5]"
                : "text-[#87867f] hover:text-[#141413] hover:bg-[#e8e5dc]/60"
            }`}
          >
            System Warnings
          </button>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="p-10 bg-[#faf9f5] rounded-2xl border border-[#cccbc8] text-center font-serif text-xs text-[#87867f]">
              Loading system notifications...
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-10 bg-[#faf9f5] rounded-2xl border border-[#cccbc8] text-center space-y-2">
              <Megaphone className="w-8 h-8 text-[#87867f] mx-auto opacity-50" />
              <h3 className="font-gothic text-sm font-bold uppercase tracking-wider text-[#141413]">
                No Notifications Found
              </h3>
              <p className="font-serif text-xs text-[#87867f]">
                You have no active system notifications in this category.
              </p>
            </div>
          ) : (
            filteredNotifications.map((item) => (
              <div
                key={item.id}
                className={`rounded-2xl border p-5 transition-all space-y-3 ${
                  item.isRead
                    ? "bg-[#faf9f5]/80 border-[#cccbc8]/60 opacity-80"
                    : "bg-[#faf9f5] border-[#cccbc8] shadow-sm"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#cccbc8]/50 pb-2.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Category Badge */}
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-gothic text-[10px] font-bold uppercase tracking-wider border ${
                        item.category === "System Warning"
                          ? "bg-red-500/15 text-red-700 border-red-500/30"
                          : "bg-[#2e7d32]/15 text-[#2e7d32] border-[#2e7d32]/30"
                      }`}
                    >
                      {item.category === "System Warning" ? (
                        <AlertTriangle className="w-3 h-3" />
                      ) : (
                        <Megaphone className="w-3 h-3" />
                      )}
                      <span>{item.category}</span>
                    </span>

                    {/* Read Status Badge */}
                    {!item.isRead && (
                      <span className="h-2 w-2 rounded-full bg-[#d97757]" title="Unread" />
                    )}

                    <h2 className="font-gothic text-sm font-bold uppercase tracking-tight text-[#141413]">
                      {item.title}
                    </h2>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-serif text-[11px] text-[#87867f]">
                      {new Date(item.timestamp).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>

                    {!item.isRead && (
                      <button
                        type="button"
                        onClick={() => handleMarkAsRead(item.id)}
                        className="font-gothic text-[10px] font-bold uppercase tracking-wider text-[#d97757] hover:underline cursor-pointer"
                      >
                        Mark Read
                      </button>
                    )}
                  </div>
                </div>

                <p className="font-serif text-xs sm:text-sm text-[#141413]/85 leading-relaxed bg-[#f0eee6] p-3.5 rounded-xl">
                  {item.message}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
