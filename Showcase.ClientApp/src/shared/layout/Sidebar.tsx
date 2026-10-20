import { Plus, Sparkles } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";
import { BrandLogo } from "../components/BrandLogo.tsx";
import { Button } from "../components/Button.tsx";
import { SidebarNavLinks, type SidebarUser } from "./SidebarNavLinks.tsx";
import { SidebarUserMenu } from "./SidebarUserMenu.tsx";

export type { SidebarUser };

export interface SidebarProps {
  user?: SidebarUser | null;
  unreadNotificationsCount?: number;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ user, unreadNotificationsCount, onLogout }) => {
  return (
    <aside
      aria-label="Main Sidebar Navigation"
      className="hidden md:flex flex-col fixed inset-y-0 left-0 w-60 lg:w-64 bg-slate-dark text-ivory-light z-40 border-r border-[#262624] shadow-none select-none"
    >
      {/* 1. Header / Platform Branding */}
      <div className="h-18 lg:h-20 px-6 flex items-center justify-between border-b border-[#262624]">
        <Link to={user ? "/feed" : "/"} className="flex items-center gap-3 group text-decoration-none" aria-label="Pority Home">
          <BrandLogo
            variant="full"
            theme="dark"
            size="md"
            className="group-hover:opacity-90 transition-opacity"
            textClassName="text-xl tracking-tight text-ivory-light font-serif"
          />
        </Link>
      </div>

      {/* 2. Middle Navigation Items */}
      <SidebarNavLinks user={user} unreadNotificationsCount={unreadNotificationsCount} />

      {/* 3. Bottom Section: Action CTAs & Profile Area */}
      <div className="p-4 border-t border-[#262624] space-y-2.5 bg-slate-dark">
        {user ? (
          <>
            {/* Red Area: New Post Button */}
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

            {/* User Profile Row with Direct Logout */}
            <SidebarUserMenu user={user} onLogout={onLogout} />
          </>
        ) : (
          <Link to="/register" className="block text-decoration-none">
            <Button
              variant="clay"
              size="md"
              fullWidth
              leftIcon={<Sparkles className="h-4 w-4" />}
              className="font-gothic uppercase tracking-wider text-xs shadow-none justify-center"
            >
              Get Started
            </Button>
          </Link>
        )}
      </div>
    </aside>
  );
};

