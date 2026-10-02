import { AlertTriangle, Bell, Heart, ShieldCheck, Sparkles, Trash2, User as UserIcon } from "lucide-react";
import React, { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { NotificationDto } from "@shared/api/apiClient.notifications.ts";

export interface NotificationRowProps {
  notification: NotificationDto;
  onMarkAsRead?: (id: string) => void;
  onDelete?: (id: string) => void;
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.max(0, Math.floor((now.getTime() - date.getTime()) / 1000));

  if (diffInSeconds < 60) return "just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d`;
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) return `${diffInWeeks}w`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export const NotificationRow: React.FC<NotificationRowProps> = ({
  notification,
  onMarkAsRead,
  onDelete,
}) => {
  const navigate = useNavigate();
  const [offsetX, setOffsetX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const currentOffsetRef = useRef(0);
  const isDraggingRef = useRef(false);
  const isHorizontalSwipeRef = useRef<boolean | null>(null);

  const typeLower = notification.type.toLowerCase();
  const isLike = typeLower === "like";
  const isProfileVisit = typeLower === "profilevisit";
  const isVerification = typeLower.startsWith("verification");
  const isFeatured = typeLower.startsWith("featured");
  const isWarning = typeLower === "system" || typeLower.includes("rejected");

  const actorUsername = notification.actorUsername?.replace(/^@/, "");
  const actorDisplayName = actorUsername || notification.actorName || "Someone";
  const actorAvatar = notification.actorAvatarUrl;

  const handleRowClick = () => {
    if (isDeleting) return;

    if (!notification.isRead && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }

    if (notification.sourcePostId) {
      navigate(`/posts/${notification.sourcePostId}`);
    } else if (isVerification) {
      navigate("/settings/security");
    } else if (isFeatured) {
      navigate("/feed");
    } else if (isProfileVisit && actorUsername) {
      navigate(`/u/${encodeURIComponent(actorUsername)}`);
    } else if (actorUsername) {
      navigate(`/u/${encodeURIComponent(actorUsername)}`);
    }
  };

  // Unified Touch & Mouse Gesture Handlers (Instagram-style Swipe-to-Delete)
  const onStart = (clientX: number, clientY: number) => {
    if (isDeleting) return;
    startXRef.current = clientX;
    startYRef.current = clientY;
    currentOffsetRef.current = 0;
    isDraggingRef.current = true;
    isHorizontalSwipeRef.current = null;
    setIsDragging(true);
  };

  const onMove = (clientX: number, clientY: number) => {
    if (!isDraggingRef.current || isDeleting) return;
    const diffX = clientX - startXRef.current;
    const diffY = clientY - startYRef.current;

    if (isHorizontalSwipeRef.current === null) {
      if (Math.abs(diffY) > Math.abs(diffX) && Math.abs(diffY) > 8) {
        isHorizontalSwipeRef.current = false;
        isDraggingRef.current = false;
        setIsDragging(false);
        currentOffsetRef.current = 0;
        setOffsetX(0);
        return;
      }
      if (Math.abs(diffX) > 6) {
        isHorizontalSwipeRef.current = true;
      }
    }

    if (isHorizontalSwipeRef.current) {
      const calculatedOffset = diffX > 0 ? Math.min(diffX, 220) : Math.max(diffX * 0.15, -25);
      currentOffsetRef.current = calculatedOffset;
      setOffsetX(calculatedOffset);
    }
  };

  const onEnd = () => {
    if (!isDraggingRef.current || isDeleting) return;
    isDraggingRef.current = false;
    setIsDragging(false);

    if (currentOffsetRef.current >= 80) {
      // Threshold crossed: trigger Instagram-style delete
      setIsDeleting(true);
      setOffsetX(350);
      setTimeout(() => {
        onDelete?.(notification.id);
      }, 260);
    } else {
      // Snap back smoothly
      currentOffsetRef.current = 0;
      setOffsetX(0);
    }
    isHorizontalSwipeRef.current = null;
  };

  // Determine system/announcement icon if not an actor-driven activity
  const renderAvatarOrIcon = () => {
    if (isLike || isProfileVisit) {
      return actorUsername ? (
        <Link
          to={`/u/${encodeURIComponent(actorUsername)}`}
          className="shrink-0 group block"
          title={`View ${actorDisplayName}'s profile`}
          onClick={(e) => e.stopPropagation()}
        >
          {actorAvatar ? (
            <img
              src={actorAvatar}
              alt={actorDisplayName}
              className="w-10 h-10 rounded-full object-cover border border-stone/80 group-hover:border-clay transition-colors"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-ivory-light border border-stone/80 group-hover:border-clay flex items-center justify-center font-gothic text-xs font-bold uppercase text-slate-dark transition-colors">
              {actorDisplayName.charAt(0) || <UserIcon className="w-4 h-4 text-cloud-dark" />}
            </div>
          )}
        </Link>
      ) : (
        <div className="w-10 h-10 rounded-full bg-ivory-light border border-stone/80 flex items-center justify-center font-gothic text-xs font-bold uppercase text-slate-dark">
          <UserIcon className="w-4 h-4 text-cloud-dark" />
        </div>
      );
    }

    if (isVerification) {
      return (
        <div className="w-10 h-10 rounded-full bg-clay/10 border border-clay/30 flex items-center justify-center text-clay shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
      );
    }

    if (isFeatured) {
      return (
        <div className="w-10 h-10 rounded-full bg-clay/10 border border-clay/30 flex items-center justify-center text-clay shrink-0">
          <Sparkles className="w-5 h-5" />
        </div>
      );
    }

    if (isWarning) {
      return (
        <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-700 shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
      );
    }

    return (
      <div className="w-10 h-10 rounded-full bg-ivory-light border border-stone/80 flex items-center justify-center text-slate-dark shrink-0">
        <Bell className="w-5 h-5" />
      </div>
    );
  };

  // Construct message content
  const renderMessageText = () => {
    if (isLike) {
      return (
        <p className="font-serif text-[13.5px] leading-snug text-slate-dark/85">
          {actorUsername ? (
            <Link
              to={`/u/${encodeURIComponent(actorUsername)}`}
              className="font-gothic font-bold text-slate-dark hover:text-clay transition-colors mr-1.5 inline-block text-decoration-none"
              onClick={(e) => e.stopPropagation()}
            >
              {actorUsername}
            </Link>
          ) : (
            <span className="font-gothic font-bold text-slate-dark mr-1.5">
              {actorDisplayName}
            </span>
          )}
          <span>liked your project</span>
        </p>
      );
    }

    if (isProfileVisit) {
      return (
        <p className="font-serif text-[13.5px] leading-snug text-slate-dark/85">
          {actorUsername ? (
            <>
              <Link
                to={`/u/${encodeURIComponent(actorUsername)}`}
                className="font-gothic font-bold text-slate-dark hover:text-clay transition-colors mr-1.5 inline-block text-decoration-none"
                onClick={(e) => e.stopPropagation()}
              >
                {actorUsername}
              </Link>
              <span>visited your profile</span>
            </>
          ) : (
            <span className="font-gothic font-semibold text-slate-dark">
              A guest viewed your profile
            </span>
          )}
        </p>
      );
    }

    // System announcements / warnings / verification updates
    return (
      <div>
        <p className="font-gothic font-bold text-xs uppercase tracking-wider text-slate-dark mb-0.5">
          {notification.title}
        </p>
        <p className="font-serif text-[13px] leading-snug text-slate-dark/80">
          {notification.message}
        </p>
      </div>
    );
  };

  const progress = Math.min(Math.max(offsetX, 0) / 100, 1);
  const iconScale = Math.min(0.5 + progress * 0.6, 1.25);
  const iconOpacity = Math.min(progress * 1.6, 1);

  return (
    <div
      className={`relative overflow-hidden rounded-xl select-none transition-all duration-300 ease-out ${
        isDeleting ? "max-h-0 opacity-0 my-0 py-0 border-none pointer-events-none" : "max-h-[140px] my-1"
      }`}
    >
      {/* Background Reveal Layer (Instagram-Style Red Trash Canvas) */}
      <div
        className="absolute inset-0 bg-rose-600 flex items-center justify-start px-5 rounded-xl text-white transition-opacity duration-150"
        style={{ opacity: Math.min(progress * 1.2, 1) }}
      >
        <div
          className="flex items-center gap-2 font-gothic text-xs font-bold uppercase tracking-wider text-white"
          style={{
            transform: `scale(${iconScale})`,
            opacity: iconOpacity,
            transition: isDragging ? "none" : "transform 0.2s ease-out, opacity 0.2s ease-out",
          }}
        >
          <Trash2 className="w-5 h-5 text-white stroke-[2.2]" />
          {progress > 0.75 && <span>Delete</span>}
        </div>
      </div>

      {/* Foreground Interactive Card (Swiped Element) */}
      <div
        onMouseDown={(e) => {
          if (e.button === 0) onStart(e.clientX, e.clientY);
        }}
        onMouseMove={(e) => {
          onMove(e.clientX, e.clientY);
        }}
        onMouseUp={() => {
          onEnd();
        }}
        onMouseLeave={() => {
          if (isDragging) onEnd();
        }}
        onTouchStart={(e) => {
          if (e.touches[0]) onStart(e.touches[0].clientX, e.touches[0].clientY);
        }}
        onTouchMove={(e) => {
          if (e.touches[0]) onMove(e.touches[0].clientX, e.touches[0].clientY);
        }}
        onTouchEnd={() => {
          onEnd();
        }}
        onTouchCancel={() => {
          onEnd();
        }}
        onClick={(e) => {
          // If pure click without meaningful drag, handle navigation
          if (Math.abs(offsetX) < 6) {
            handleRowClick();
          } else {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
        style={{
          transform: `translateX(${offsetX}px)`,
          transition: isDragging ? "none" : "transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)",
          touchAction: "pan-y",
        }}
        className={`group relative z-10 w-full flex items-center justify-between gap-3 sm:gap-4 py-3 sm:py-3.5 px-3 sm:px-4 rounded-xl border border-stone/30 cursor-pointer shadow-sm ${
          notification.isRead
            ? "bg-ivory-light hover:bg-ivory-light/90"
            : "bg-[#f5ede2] hover:bg-[#efe4d6] border-clay/30"
        }`}
      >
        {/* Left + Middle: Avatar + Text + Timestamp */}
        <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 flex-1">
          {/* Unread indicator dot */}
          <div className="w-2 flex justify-center shrink-0">
            {!notification.isRead && (
              <span className="w-2 h-2 rounded-full bg-clay" title="Unread" />
            )}
          </div>

          {/* Avatar or System Icon */}
          {renderAvatarOrIcon()}

          {/* Message Content & Timestamp */}
          <div className="min-w-0 flex-1">
            {renderMessageText()}
            <span className="font-mono text-[11px] text-cloud-dark block mt-0.5">
              {formatRelativeTime(notification.createdAtUtc)}
            </span>
          </div>
        </div>

        {/* Far Right: Post Thumbnail (for Like) or subtle action */}
        {isLike && notification.sourcePostId && (
          <Link
            to={`/posts/${notification.sourcePostId}`}
            className="shrink-0 block rounded-lg overflow-hidden border border-stone/70 hover:border-clay transition-all duration-150 group/thumb"
            title={notification.postTitle ? `View post: ${notification.postTitle}` : "View post"}
            onClick={(e) => e.stopPropagation()}
          >
            {notification.postCoverUrl ? (
              <img
                src={notification.postCoverUrl}
                alt={notification.postTitle || "Post thumbnail"}
                className="w-11 h-11 sm:w-12 sm:h-12 object-cover group-hover/thumb:scale-105 transition-transform"
              />
            ) : (
              <div className="w-11 h-11 sm:w-12 sm:h-12 bg-ivory-medium flex items-center justify-center text-cloud-dark">
                <Heart className="w-4 h-4 text-clay fill-clay/20" />
              </div>
            )}
          </Link>
        )}
      </div>
    </div>
  );
};
