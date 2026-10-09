import { Bell } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

export const NOTIFICATION_ARRIVED_EVENT = "pority_notification_arrived";

export interface NotificationBellBadgeProps {
  unreadCount?: number;
  isActive?: boolean;
  className?: string;
  iconClassName?: string;
  badgeRingColor?: string;
}

export const NotificationBellBadge: React.FC<NotificationBellBadgeProps> = ({
  unreadCount = 0,
  isActive = false,
  className = "",
  iconClassName = "h-4.5 w-4.5",
  badgeRingColor = "ring-[#262624]",
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const prevCountRef = useRef(unreadCount);
  const animationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerAnimation = () => {
    setIsAnimating(true);
    if (animationTimerRef.current) {
      clearTimeout(animationTimerRef.current);
    }
    animationTimerRef.current = setTimeout(() => {
      setIsAnimating(false);
    }, 600);
  };

  // Trigger animation when unread count increases
  useEffect(() => {
    if (unreadCount > prevCountRef.current) {
      triggerAnimation();
    }
    prevCountRef.current = unreadCount;
  }, [unreadCount]);

  // Trigger animation when real-time event arrives
  useEffect(() => {
    const handleArrival = () => triggerAnimation();
    window.addEventListener(NOTIFICATION_ARRIVED_EVENT, handleArrival);

    return () => {
      window.removeEventListener(NOTIFICATION_ARRIVED_EVENT, handleArrival);
      if (animationTimerRef.current) {
        clearTimeout(animationTimerRef.current);
      }
    };
  }, []);

  const displayCount = unreadCount > 9 ? "9+" : unreadCount.toString();

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Bell Icon with gentle subtle tilt on arrival */}
      <Bell
        className={`shrink-0 transition-all duration-300 ${iconClassName} ${
          isActive ? "text-clay" : "text-cloud-dark"
        } ${isAnimating ? "rotate-[-10deg] scale-110" : "rotate-0 scale-100"}`}
      />

      {/* Numeric Unread Badge */}
      {unreadCount > 0 && (
        <span
          className={`absolute -top-1.5 -right-2 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-clay text-ivory-light text-[9.5px] font-mono font-bold leading-none ring-2 ${badgeRingColor} transition-transform duration-300 ${
            isAnimating ? "scale-125 bg-[#e05d15]" : "scale-100"
          }`}
        >
          {displayCount}
        </span>
      )}
    </div>
  );
};
