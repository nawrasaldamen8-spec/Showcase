import { Briefcase, LayoutGrid, Settings as SettingsIcon, User as UserIcon } from "lucide-react";
import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import type { SidebarUser } from "./Sidebar.tsx";

export interface MobileBottomNavProps {
  user?: SidebarUser | null;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ user }) => {
  const location = useLocation();

  const isLinkActive = (to: string, isActive: boolean) => {
    if (isActive) return true;
    if (to === "/studio" && (location.pathname === "/" || location.pathname === "/posts/mine")) return true;
    if (to === "/career" && location.pathname.startsWith("/career")) return true;
    return false;
  };

  const navItems = [
    { label: "Studio", to: "/studio", icon: LayoutGrid },
    { label: "Career", to: "/career", icon: Briefcase },
    {
      label: "Profile",
      to: user ? `/u/${user.username}` : "/settings",
      icon: UserIcon,
      isAvatar: Boolean(user?.avatarUrl),
      avatarUrl: user?.avatarUrl,
    },
    { label: "Settings", to: "/settings", icon: SettingsIcon },
  ];

  return (
    <nav
      aria-label="Mobile Primary Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#faf9f5]/95 backdrop-blur-md border-t border-[#cccbc8]/60 flex items-center justify-around z-40 px-2 shadow-none select-none transition-colors"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            aria-label={item.label}
            className={({ isActive }) => {
              const active = isLinkActive(item.to, isActive);
              return `flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
                active ? "text-[#141413]" : "text-[#87867f] hover:text-[#141413]"
              }`;
            }}
          >
            {({ isActive }) => {
              const active = isLinkActive(item.to, isActive);
              return (
                <>
                  {item.isAvatar && item.avatarUrl ? (
                    <img
                      src={item.avatarUrl}
                      alt={item.label}
                      className={`h-6 w-6 rounded-full object-cover transition-all ${
                        active
                          ? "ring-2 ring-[#141413] ring-offset-1 ring-offset-[#faf9f5]"
                          : "opacity-70 hover:opacity-100"
                      }`}
                    />
                  ) : (
                    <Icon
                      className={`h-6 w-6 transition-transform duration-200 ${
                        active ? "stroke-[2.2] scale-105 text-[#141413]" : "stroke-[1.6]"
                      }`}
                    />
                  )}

                  {/* Active Indicator Dot */}
                  <span
                    className={`w-1.5 h-1.5 rounded-full mt-1 transition-opacity duration-200 ${
                      active ? "bg-[#d97757] opacity-100" : "opacity-0"
                    }`}
                  />
                </>
              );
            }}
          </NavLink>
        );
      })}
    </nav>
  );
};
