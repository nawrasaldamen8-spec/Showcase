import { Settings } from "lucide-react";
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { BrandLogo } from "@shared/components/BrandLogo.tsx";
import { NotificationBellBadge } from "@shared/components/NotificationBellBadge.tsx";
import { useAuth } from "../context/index.ts";

export interface MobileTopBarProps {
  unreadNotificationsCount?: number;
}

export const MobileTopBar: React.FC<MobileTopBarProps> = ({
  unreadNotificationsCount = 0,
}) => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const unreadCount = unreadNotificationsCount;

  const isProfilePage = location.pathname.startsWith("/u/") || location.pathname.startsWith("/profile");

  return (
    <header
      aria-label="Mobile Top Bar"
      className="md:hidden sticky top-0 z-30 h-14 bg-ivory-light/95 backdrop-blur-md border-b border-stone/60 px-4 flex items-center justify-between shadow-none select-none transition-colors"
    >
      {/* Brand Wordmark (Aligned Left) */}
      <Link
        to={currentUser ? "/studio" : "/"}
        className="inline-flex items-center text-decoration-none group"
        aria-label="Pority Home"
      >
        <BrandLogo variant="wordmark" size="sm" />
      </Link>

      {/* Right: Conditional Navigation (Settings on Profile, Notifications elsewhere) */}
      <div className="flex items-center gap-1">
        {isProfilePage ? (
          <Link
            to="/settings"
            aria-label="Account Settings"
            title="Account Settings"
            className="flex items-center justify-center h-9 w-9 rounded-xl text-slate-dark hover:bg-[#e8e5dc]/70 active:scale-95 transition-all cursor-pointer"
          >
            <Settings className="h-5 w-5 stroke-[1.8]" />
          </Link>
        ) : currentUser ? (
          <Link
            to="/notifications"
            aria-label="Notifications"
            title="Notifications"
            className="flex items-center justify-center h-9 w-9 rounded-xl text-slate-dark hover:bg-[#e8e5dc]/70 active:scale-95 transition-all cursor-pointer"
          >
            <NotificationBellBadge
              unreadCount={unreadCount}
              isActive={location.pathname === "/notifications"}
              iconClassName="h-5 w-5 stroke-[1.8]"
              badgeRingColor="ring-ivory-light"
            />
          </Link>
        ) : null}
      </div>
    </header>
  );
};
