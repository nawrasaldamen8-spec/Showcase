import { AlertTriangle, Eye, Megaphone } from "lucide-react";
import React from "react";

export interface NotificationCardItem {
  id: string;
  title: string;
  message: string;
  category: "Announcement" | "System Warning" | "Activity";
  timestamp: string;
  isRead: boolean;
}

export interface NotificationCardProps {
  item: NotificationCardItem;
  onMarkAsRead?: (id: string) => void;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({
  item,
  onMarkAsRead,
}) => {
  return (
    <div
      className={`rounded-2xl border p-5 transition-all space-y-3 ${
        item.isRead
          ? "bg-ivory-light/80 border-stone/60 opacity-80"
          : "bg-ivory-light border-slate-dark/40"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone/50 pb-2.5">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Category Badge */}
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-gothic text-[10px] font-bold uppercase tracking-wider border ${
              item.category === "System Warning"
                ? "bg-red-500/15 text-red-700 border-red-500/30"
                : item.category === "Activity"
                ? "bg-clay/15 text-clay border-clay/30"
                : "bg-[#2e7d32]/15 text-[#2e7d32] border-[#2e7d32]/30"
            }`}
          >
            {item.category === "System Warning" ? (
              <AlertTriangle className="w-3 h-3" />
            ) : item.category === "Activity" ? (
              <Eye className="w-3 h-3" />
            ) : (
              <Megaphone className="w-3 h-3" />
            )}
            <span>{item.category}</span>
          </span>

          {/* Read Status Badge */}
          {!item.isRead && (
            <span className="h-2 w-2 rounded-full bg-clay" title="Unread" />
          )}

          <h2 className="font-gothic text-sm font-bold uppercase tracking-tight text-slate-dark">
            {item.title}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-serif text-[11px] text-cloud-dark">
            {new Date(item.timestamp).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>

          {!item.isRead && onMarkAsRead && (
            <button
              type="button"
              onClick={() => onMarkAsRead(item.id)}
              className="font-gothic text-[10px] font-bold uppercase tracking-wider text-clay hover:underline cursor-pointer"
            >
              Mark Read
            </button>
          )}
        </div>
      </div>

      <p className="font-serif text-xs sm:text-sm text-slate-dark/85 leading-relaxed bg-ivory-medium p-3.5 rounded-xl">
        {item.message}
      </p>
    </div>
  );
};
