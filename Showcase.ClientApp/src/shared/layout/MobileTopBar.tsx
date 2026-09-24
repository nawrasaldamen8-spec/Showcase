import { Bell, Plus } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";
import { useToast } from "../context/index.ts";

export const MobileTopBar: React.FC = () => {
  const { showToast } = useToast();

  const handleNotificationClick = () => {
    showToast("info", "Exhibition notifications will be available in the upcoming release.");
  };

  return (
    <header
      aria-label="Mobile Top Bar"
      className="md:hidden sticky top-0 z-30 h-14 bg-[#faf9f5]/95 backdrop-blur-md border-b border-[#cccbc8]/60 px-4 flex items-center justify-between shadow-none select-none transition-colors"
    >
      {/* Left: Quick Add Button (+) with Soft Rounded Corners */}
      <div className="flex items-center">
        <Link
          to="/posts/new"
          aria-label="Create new exhibition plate"
          className="flex items-center justify-center h-9 w-9 rounded-xl bg-[#141413] text-[#faf9f5] hover:bg-[#d97757] active:scale-95 transition-all shadow-none"
        >
          <Plus className="h-5 w-5 stroke-[2.2]" />
        </Link>
      </div>

      {/* Center: Centered Platform Logo */}
      <div className="flex items-center justify-center">
        <Link
          to="/studio"
          className="font-gothic font-extrabold text-base tracking-[0.18em] uppercase text-[#141413] hover:text-[#d97757] transition-colors"
          aria-label="SHOWCASE Home"
        >
          SHOWCASE
        </Link>
      </div>

      {/* Right: Notifications Bell (UI Placeholder) */}
      <div className="flex items-center">
        <button
          type="button"
          onClick={handleNotificationClick}
          aria-label="Notifications"
          className="flex items-center justify-center h-9 w-9 rounded-xl text-[#141413] hover:bg-[#e8e5dc]/70 active:scale-95 transition-all cursor-pointer relative"
        >
          <Bell className="h-5 w-5 stroke-[1.8]" />
          {/* Subtle indicator dot */}
          <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#d97757]" />
        </button>
      </div>
    </header>
  );
};
