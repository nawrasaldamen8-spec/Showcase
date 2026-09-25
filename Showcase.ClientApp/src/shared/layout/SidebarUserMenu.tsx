import { Briefcase, ExternalLink, LayoutGrid, LogOut, Settings as SettingsIcon, Sparkles, User as UserIcon } from "lucide-react";
import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useClickOutside } from "../hooks/useClickOutside.ts";
import type { DemoPersona } from "./DemoSwitcher.tsx";
import type { SidebarUser } from "./SidebarNavLinks.tsx";

export interface SidebarUserMenuProps {
  user?: SidebarUser | null;
  onPersonaChange?: (persona: DemoPersona) => void;
  onLogout?: () => void;
}

export const SidebarUserMenu: React.FC<SidebarUserMenuProps> = ({ user, onPersonaChange, onLogout }) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useClickOutside(userMenuRef, () => setUserMenuOpen(false), userMenuOpen);

  return (
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
  );
};
