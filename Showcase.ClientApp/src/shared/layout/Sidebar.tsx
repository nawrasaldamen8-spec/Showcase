import {
  Briefcase,
  ExternalLink,
  LayoutGrid,
  LogOut,
  Plus,
  Settings as SettingsIcon,
  Sparkles,
  User as UserIcon,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Button } from "../components/Button.tsx";
import { DemoSwitcher, type DemoPersona } from "./DemoSwitcher.tsx";

export interface SidebarUser {
  username: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
}

export interface SidebarProps {
  user?: SidebarUser | null;
  currentPersona?: DemoPersona;
  onPersonaChange?: (persona: DemoPersona) => void;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ user, currentPersona = "creator", onPersonaChange, onLogout }) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    if (userMenuOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [userMenuOpen]);

  const isLinkActive = (to: string, isActive: boolean) => {
    if (isActive) return true;
    if (to === "/studio" && (location.pathname === "/" || location.pathname === "/posts/mine")) return true;
    if (to === "/career" && location.pathname.startsWith("/career")) return true;
    return false;
  };

  const navLinks = [
    { label: "Studio", to: "/studio", icon: LayoutGrid },
    { label: "Career", to: "/career", icon: Briefcase },
    ...(user ? [{ label: "Profile", to: `/u/${user.username}`, icon: UserIcon }] : []),
    { label: "Settings", to: "/settings", icon: SettingsIcon },
  ];

  return (
    <aside
      aria-label="Main Sidebar Navigation"
      className="hidden md:flex flex-col fixed inset-y-0 left-0 w-60 lg:w-64 bg-[#141413] text-[#faf9f5] z-40 border-r border-[#262624] shadow-none select-none"
    >
      {/* 1. Header / Platform Branding (VSCO Style) */}
      <div className="h-18 lg:h-20 px-6 flex items-center justify-between border-b border-[#262624]">
        <Link to="/studio" className="flex items-center gap-3 group text-decoration-none" aria-label="SHOWCASE Home">
          {/* Minimalist Aperture / Shutter Emblem */}
          <div className="w-8 h-8 rounded-full border border-[#faf9f5]/30 flex items-center justify-center bg-[#262624] group-hover:border-[#d97757] transition-colors">
            <svg
              className="w-4 h-4 text-[#faf9f5] group-hover:text-[#d97757] transition-colors"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="14.31" y1="8" x2="20.05" y2="17.94" />
              <line x1="9.69" y1="8" x2="21.17" y2="8" />
              <line x1="7.38" y1="12" x2="13.12" y2="2.06" />
              <line x1="9.69" y1="16" x2="3.95" y2="6.06" />
              <line x1="14.31" y1="16" x2="2.83" y2="16" />
              <line x1="16.62" y1="12" x2="10.88" y2="21.94" />
            </svg>
          </div>
          <span className="font-gothic font-extrabold text-lg lg:text-xl tracking-[0.18em] uppercase text-[#faf9f5] group-hover:text-[#d97757] transition-colors">
            SHOWCASE
          </span>
        </Link>
      </div>

      {/* 2. Middle Navigation Items (Vertical List) */}
      <div className="flex-1 py-6 px-3.5 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2">
          <p className="font-gothic text-[10px] font-bold uppercase tracking-[0.18em] text-[#87867f]">
            Exhibition Feed
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
                      {/* Active indicator dot */}
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

      {/* 3. Bottom Section: CTA, Persona, Profile Menu */}
      <div className="p-4 border-t border-[#262624] space-y-3 bg-[#141413]">
        {/* "+ New Post" Action Button */}
        <Link to="/posts/new" className="block text-decoration-none">
          <Button
            variant="clay"
            size="md"
            fullWidth
            leftIcon={<Plus className="h-4 w-4" />}
            className="font-gothic uppercase tracking-wider text-xs shadow-none justify-center"
          >
            New Post
          </Button>
        </Link>

        {/* Demo Persona Switcher */}
        <div className="pt-1">
          <DemoSwitcher
            currentPersona={currentPersona}
            onPersonaChange={onPersonaChange}
            className="w-full justify-between bg-[#262624]/60 border border-[#262624] text-[#faf9f5]"
          />
        </div>

        {/* User Account / Profile Menu Popover */}
        <div className="relative pt-1" ref={userMenuRef}>
          <button
            type="button"
            onClick={() => setUserMenuOpen((prev) => !prev)}
            aria-expanded={userMenuOpen}
            aria-haspopup="true"
            aria-label="User Account Options"
            className="w-full flex items-center justify-between p-2 rounded-xl border border-[#262624] bg-[#1a1a19] hover:bg-[#262624] transition-colors cursor-pointer text-left"
          >
            <div className="flex items-center gap-3 min-w-0">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.username || "User avatar"}
                  className="h-8 w-8 rounded-full object-cover shrink-0 border border-[#262624]"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-[#262624] text-[#faf9f5] flex items-center justify-center font-gothic text-xs font-bold uppercase shrink-0 border border-[#faf9f5]/20">
                  {user?.firstName?.[0] || user?.username?.[0] || <UserIcon className="h-4 w-4" />}
                </div>
              )}
              <div className="min-w-0">
                <p className="font-gothic text-xs font-bold uppercase tracking-wider text-[#faf9f5] truncate">
                  {user ? (user.firstName ? `${user.firstName} ${user.lastName || ""}` : user.username) : "Visitor"}
                </p>
                <p className="font-serif text-[11px] text-[#87867f] truncate">
                  {user ? `@${user.username}` : "Public Gallery"}
                </p>
              </div>
            </div>
            <SettingsIcon className="h-4 w-4 text-[#87867f] shrink-0 ml-1" />
          </button>

          {/* Account Dropdown Drawer */}
          {userMenuOpen && (
            <div
              role="menu"
              className="absolute bottom-full left-0 right-0 mb-2 bg-[#1a1a19] border border-[#262624] rounded-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100 shadow-none text-[#faf9f5]"
            >
              {user ? (
                <>
                  <div className="px-4 py-2 border-b border-[#262624]">
                    <p className="font-gothic text-xs font-bold uppercase tracking-wider text-[#faf9f5] truncate">
                      {user.firstName ? `${user.firstName} ${user.lastName || ""}` : user.username}
                    </p>
                    <p className="font-serif text-xs text-[#87867f] truncate">@{user.username}</p>
                  </div>

                  <div className="py-1">
                    <Link
                      to={`/u/${user.username}`}
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-gothic uppercase tracking-wider text-[#faf9f5] hover:bg-[#262624] transition-colors"
                      role="menuitem"
                    >
                      <ExternalLink className="h-3.5 w-3.5 text-[#87867f]" />
                      <span>View Public Profile</span>
                    </Link>

                    <Link
                      to="/career"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-gothic uppercase tracking-wider text-[#faf9f5] hover:bg-[#262624] transition-colors"
                      role="menuitem"
                    >
                      <Briefcase className="h-3.5 w-3.5 text-[#87867f]" />
                      <span>Career Hub</span>
                    </Link>

                    <Link
                      to="/studio"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-gothic uppercase tracking-wider text-[#faf9f5] hover:bg-[#262624] transition-colors"
                      role="menuitem"
                    >
                      <LayoutGrid className="h-3.5 w-3.5 text-[#87867f]" />
                      <span>Creator Studio</span>
                    </Link>

                    <Link
                      to="/settings"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-gothic uppercase tracking-wider text-[#faf9f5] hover:bg-[#262624] transition-colors"
                      role="menuitem"
                    >
                      <SettingsIcon className="h-3.5 w-3.5 text-[#87867f]" />
                      <span>Account Settings</span>
                    </Link>
                  </div>

                  {onLogout && (
                    <div className="border-t border-[#262624] pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setUserMenuOpen(false);
                          onLogout();
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-gothic uppercase tracking-wider text-[#d97757] hover:bg-[#262624] transition-colors text-left cursor-pointer"
                        role="menuitem"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="p-2">
                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false);
                      onPersonaChange?.("creator");
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-gothic uppercase tracking-wider text-[#faf9f5] hover:bg-[#262624] rounded-lg transition-colors text-left cursor-pointer"
                    role="menuitem"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-[#d97757]" />
                    <span>Switch to Creator</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
