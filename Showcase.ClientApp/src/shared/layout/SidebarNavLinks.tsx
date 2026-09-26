import { Bell, Briefcase, LayoutGrid, Search, User as UserIcon } from "lucide-react";
import React from "react";
import { NavLink, useLocation } from "react-router-dom";

export interface SidebarUser {
  username: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  isVerified?: boolean;
  roles?: string[];
}

export interface SidebarNavLinksProps {
  user?: SidebarUser | null;
}

export const SidebarNavLinks: React.FC<SidebarNavLinksProps> = ({ user }) => {
  const location = useLocation();

  const isLinkActive = (to: string, isActive: boolean) => {
    if (isActive) return true;
    if (to === "/studio" && (location.pathname === "/" || location.pathname === "/posts/mine")) return true;
    if (to === "/feed" && (location.pathname.startsWith("/feed") || location.pathname.startsWith("/search"))) return true;
    if (to === "/career" && location.pathname.startsWith("/career")) return true;
    if (to === "/notifications" && location.pathname.startsWith("/notifications")) return true;
    return false;
  };

  const navLinks = [
    { label: "Studio", to: "/studio", icon: LayoutGrid },
    { label: "Feed", to: "/feed", icon: Search },
    { label: "Career", to: "/career", icon: Briefcase },
    { label: "Notifications", to: "/notifications", icon: Bell },
    ...(user ? [{ label: "Profile", to: `/u/${user.username}`, icon: UserIcon }] : []),
  ];

  return (
    <div className="flex-1 py-6 px-3.5 space-y-1.5 overflow-y-auto">
      <div className="px-3 pb-2">
        <p className="font-gothic text-[10px] font-bold uppercase tracking-[0.18em] text-[#87867f]">
          Community &amp; Studio
        </p>
      </div>

      <nav className="space-y-1" aria-label="Sidebar Primary Navigation">
        {navLinks.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => {
                const active = isLinkActive(link.to, isActive);
                return `flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl font-gothic text-[13px] font-semibold uppercase tracking-[0.12em] transition-all relative ${
                  active ? "bg-[#262624] text-[#faf9f5]" : "text-[#87867f] hover:text-[#faf9f5] hover:bg-[#262624]/50"
                }`;
              }}
            >
              {({ isActive }) => {
                const active = isLinkActive(link.to, isActive);
                return (
                  <>
                    {active && <span className="absolute left-1.5 w-1 h-4 rounded-full bg-[#d97757]" />}
                    <Icon className={`h-4.5 w-4.5 shrink-0 ${active ? "text-[#d97757]" : "text-[#87867f]"}`} />
                    <span>{link.label}</span>
                  </>
                );
              }}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};
