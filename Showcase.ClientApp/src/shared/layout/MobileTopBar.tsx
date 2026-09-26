import { Bell, LogOut, Settings } from "lucide-react";
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/index.ts";

export const MobileTopBar: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();

  const isProfilePage = location.pathname.startsWith("/u/") || location.pathname.startsWith("/profile");

  return (
    <header
      aria-label="Mobile Top Bar"
      className="md:hidden sticky top-0 z-30 h-14 bg-[#faf9f5]/95 backdrop-blur-md border-b border-[#cccbc8]/60 px-3 flex items-center justify-between shadow-none select-none transition-colors"
    >
      {/* Left: Sign Out */}
      {currentUser ? (
        <button
          type="button"
          onClick={logout}
          aria-label="Sign Out"
          title="Sign Out"
          className="flex items-center justify-center h-9 w-9 rounded-xl text-[#d97757] hover:bg-[#d97757]/10 active:scale-95 transition-all cursor-pointer"
        >
          <LogOut className="h-4.5 w-4.5 stroke-[1.8]" />
        </button>
      ) : (
        <div className="w-9" />
      )}

      {/* Center: Platform Branding */}
      <Link
        to="/studio"
        className="inline-flex items-center text-decoration-none group"
        aria-label="Pority Home"
      >
        <span className="font-serif text-xl font-bold tracking-tight text-[#141413] group-hover:text-[#d97757] transition-colors">
          Pority
        </span>
      </Link>

      {/* Right: Conditional Action (Settings on Profile, Notifications elsewhere) */}
      {isProfilePage ? (
        <Link
          to="/settings"
          aria-label="Account Settings"
          title="Account Settings"
          className="flex items-center justify-center h-9 w-9 rounded-xl text-[#141413] hover:bg-[#e8e5dc]/70 active:scale-95 transition-all cursor-pointer"
        >
          <Settings className="h-5 w-5 stroke-[1.8]" />
        </Link>
      ) : (
        <Link
          to="/notifications"
          aria-label="Notifications"
          title="Notifications"
          className="flex items-center justify-center h-9 w-9 rounded-xl text-[#141413] hover:bg-[#e8e5dc]/70 active:scale-95 transition-all cursor-pointer"
        >
          <Bell className="h-5 w-5 stroke-[1.8]" />
        </Link>
      )}
    </header>
  );
};

