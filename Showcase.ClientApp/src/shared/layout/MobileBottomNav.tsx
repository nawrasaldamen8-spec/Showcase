import { Briefcase, LayoutGrid, Plus, Search, User as UserIcon } from "lucide-react";
import React from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import type { SidebarUser } from "./Sidebar.tsx";

export interface MobileBottomNavProps {
  user?: SidebarUser | null;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ user }) => {
  const location = useLocation();

  const isLinkActive = (to: string) => {
    if (to === "/studio" && (location.pathname === "/" || location.pathname === "/posts/mine" || location.pathname === "/studio")) return true;
    if (to === "/career" && location.pathname.startsWith("/career")) return true;
    if (to === "/feed" && (location.pathname.startsWith("/feed") || location.pathname.startsWith("/search"))) return true;
    if (user && to === `/u/${user.username}` && location.pathname.startsWith(`/u/${user.username}`)) return true;
    return false;
  };

  return (
    <nav
      aria-label="Mobile Primary Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#faf9f5]/95 backdrop-blur-md border-t border-[#cccbc8]/60 flex items-center justify-around z-40 px-3 shadow-none select-none transition-colors"
    >
      {/* 1. Studio */}
      <NavLink
        to="/studio"
        aria-label="Studio"
        className={() => {
          const active = isLinkActive("/studio");
          return `flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
            active ? "text-[#141413]" : "text-[#87867f] hover:text-[#141413]"
          }`;
        }}
      >
        <LayoutGrid className={`h-5 w-5 transition-transform duration-200 ${isLinkActive("/studio") ? "stroke-[2.2] scale-105 text-[#141413]" : "stroke-[1.6]"}`} />
        <span className={`w-1.5 h-1.5 rounded-full mt-1 transition-opacity duration-200 ${isLinkActive("/studio") ? "bg-[#d97757] opacity-100" : "opacity-0"}`} />
      </NavLink>

      {/* 2. Career */}
      <NavLink
        to="/career"
        aria-label="Career"
        className={() => {
          const active = isLinkActive("/career");
          return `flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
            active ? "text-[#141413]" : "text-[#87867f] hover:text-[#141413]"
          }`;
        }}
      >
        <Briefcase className={`h-5 w-5 transition-transform duration-200 ${isLinkActive("/career") ? "stroke-[2.2] scale-105 text-[#141413]" : "stroke-[1.6]"}`} />
        <span className={`w-1.5 h-1.5 rounded-full mt-1 transition-opacity duration-200 ${isLinkActive("/career") ? "bg-[#d97757] opacity-100" : "opacity-0"}`} />
      </NavLink>

      {/* 3. Center Action: New Post (#D97757) */}
      <Link
        to="/posts/new"
        aria-label="Create New Post"
        className="flex items-center justify-center -mt-5 h-12 w-12 rounded-full bg-[#d97757] text-[#faf9f5] hover:bg-[#c86646] active:scale-95 transition-all shadow-md border-2 border-[#faf9f5]"
      >
        <Plus className="h-6 w-6 stroke-[2.4]" />
      </Link>

      {/* 4. Feed / Discover */}
      <NavLink
        to="/feed"
        aria-label="Feed"
        className={() => {
          const active = isLinkActive("/feed");
          return `flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
            active ? "text-[#141413]" : "text-[#87867f] hover:text-[#141413]"
          }`;
        }}
      >
        <Search className={`h-5 w-5 transition-transform duration-200 ${isLinkActive("/feed") ? "stroke-[2.2] scale-105 text-[#141413]" : "stroke-[1.6]"}`} />
        <span className={`w-1.5 h-1.5 rounded-full mt-1 transition-opacity duration-200 ${isLinkActive("/feed") ? "bg-[#d97757] opacity-100" : "opacity-0"}`} />
      </NavLink>

      {/* 5. Profile */}
      <NavLink
        to={user ? `/u/${user.username}` : "/studio"}
        aria-label="Profile"
        className={() => {
          const active = user ? isLinkActive(`/u/${user.username}`) : false;
          return `flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
            active ? "text-[#141413]" : "text-[#87867f] hover:text-[#141413]"
          }`;
        }}
      >
        {user?.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt="Profile"
            className={`h-5.5 w-5.5 rounded-full object-cover transition-all ${
              isLinkActive(user ? `/u/${user.username}` : "")
                ? "ring-2 ring-[#141413] ring-offset-1 ring-offset-[#faf9f5]"
                : "opacity-70 hover:opacity-100"
            }`}
          />
        ) : (
          <UserIcon
            className={`h-5 w-5 transition-transform duration-200 ${
              isLinkActive(user ? `/u/${user.username}` : "") ? "stroke-[2.2] scale-105 text-[#141413]" : "stroke-[1.6]"
            }`}
          />
        )}
        <span
          className={`w-1.5 h-1.5 rounded-full mt-1 transition-opacity duration-200 ${
            isLinkActive(user ? `/u/${user.username}` : "") ? "bg-[#d97757] opacity-100" : "opacity-0"
          }`}
        />
      </NavLink>
    </nav>
  );
};
