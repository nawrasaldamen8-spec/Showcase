import { Briefcase, LayoutGrid, Plus, Search, User as UserIcon } from "lucide-react";
import React from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import type { SidebarUser } from "./Sidebar.tsx";

export interface MobileBottomNavProps {
  user?: SidebarUser | null;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ user }) => {
  const location = useLocation();

  const isLinkActive = (to: string, isActive: boolean) => {
    if (isActive) return true;
    if (to === "/studio" && (location.pathname === "/" || location.pathname === "/posts/mine")) return true;
    if (to === "/feed" && location.pathname.startsWith("/search")) return true;
    return false;
  };

  return (
    <nav
      aria-label="Mobile Primary Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-ivory-light/95 backdrop-blur-md border-t border-stone/60 flex items-center justify-around z-40 px-3 shadow-none select-none transition-colors"
    >
      {/* 1. Feed (الفيد - أقصى اليسار) */}
      <NavLink
        to="/feed"
        aria-label="Feed"
        className={({ isActive }) => {
          const active = isLinkActive("/feed", isActive);
          return `flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
            active ? "text-slate-dark" : "text-cloud-dark hover:text-slate-dark"
          }`;
        }}
      >
        {({ isActive }) => {
          const active = isLinkActive("/feed", isActive);
          return (
            <>
              <Search className={`h-5 w-5 transition-transform duration-200 ${active ? "stroke-[2.2] scale-105 text-slate-dark" : "stroke-[1.6]"}`} />
              <span className={`w-1.5 h-1.5 rounded-full mt-1 transition-opacity duration-200 ${active ? "bg-clay opacity-100" : "opacity-0"}`} />
            </>
          );
        }}
      </NavLink>

      {/* 2. Career (منطقة الكرير) */}
      <NavLink
        to="/career"
        aria-label="Career"
        className={({ isActive }) => `flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
          isActive ? "text-slate-dark" : "text-cloud-dark hover:text-slate-dark"
        }`}
      >
        {({ isActive }) => (
          <>
            <Briefcase className={`h-5 w-5 transition-transform duration-200 ${isActive ? "stroke-[2.2] scale-105 text-slate-dark" : "stroke-[1.6]"}`} />
            <span className={`w-1.5 h-1.5 rounded-full mt-1 transition-opacity duration-200 ${isActive ? "bg-clay opacity-100" : "opacity-0"}`} />
          </>
        )}
      </NavLink>

      {/* 3. Center Action: New Post (زر الاضافة - المنتصف) */}
      <Link
        to="/posts/new"
        aria-label="Create New Post"
        className="flex items-center justify-center -mt-5 h-12 w-12 rounded-full bg-clay text-ivory-light hover:bg-[#c86646] active:scale-95 transition-all border-2 border-ivory-light"
      >
        <Plus className="h-6 w-6 stroke-[2.4]" />
      </Link>

      {/* 4. Studio (معرض النشر) */}
      <NavLink
        to="/studio"
        aria-label="Studio"
        className={({ isActive }) => {
          const active = isLinkActive("/studio", isActive);
          return `flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
            active ? "text-slate-dark" : "text-cloud-dark hover:text-slate-dark"
          }`;
        }}
      >
        {({ isActive }) => {
          const active = isLinkActive("/studio", isActive);
          return (
            <>
              <LayoutGrid className={`h-5 w-5 transition-transform duration-200 ${active ? "stroke-[2.2] scale-105 text-slate-dark" : "stroke-[1.6]"}`} />
              <span className={`w-1.5 h-1.5 rounded-full mt-1 transition-opacity duration-200 ${active ? "bg-clay opacity-100" : "opacity-0"}`} />
            </>
          );
        }}
      </NavLink>

      {/* 5. Profile (الحساب الشخصي - أقصى اليمين) */}
      <NavLink
        to={user ? `/u/${user.username}` : "/login"}
        aria-label="Profile"
        className={({ isActive }) => `flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
          isActive ? "text-slate-dark" : "text-cloud-dark hover:text-slate-dark"
        }`}
      >
        {({ isActive }) => (
          <>
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt="Profile"
                className={`h-5.5 w-5.5 rounded-full object-cover transition-all ${
                  isActive
                    ? "ring-2 ring-slate-dark ring-offset-1 ring-offset-ivory-light"
                    : "opacity-70 hover:opacity-100"
                }`}
              />
            ) : (
              <UserIcon
                className={`h-5 w-5 transition-transform duration-200 ${
                  isActive ? "stroke-[2.2] scale-105 text-slate-dark" : "stroke-[1.6]"
                }`}
              />
            )}
            <span
              className={`w-1.5 h-1.5 rounded-full mt-1 transition-opacity duration-200 ${
                isActive ? "bg-clay opacity-100" : "opacity-0"
              }`}
            />
          </>
        )}
      </NavLink>
    </nav>
  );
};
