import { Plus } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/Button.tsx";
import { DemoSwitcher, type DemoPersona } from "./DemoSwitcher.tsx";
import { SidebarNavLinks, type SidebarUser } from "./SidebarNavLinks.tsx";
import { SidebarUserMenu } from "./SidebarUserMenu.tsx";

export type { SidebarUser };

export interface SidebarProps {
  user?: SidebarUser | null;
  currentPersona?: DemoPersona;
  onPersonaChange?: (persona: DemoPersona) => void;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ user, currentPersona = "creator", onPersonaChange, onLogout }) => {
  return (
    <aside
      aria-label="Main Sidebar Navigation"
      className="hidden md:flex flex-col fixed inset-y-0 left-0 w-60 lg:w-64 bg-[#141413] text-[#faf9f5] z-40 border-r border-[#262624] shadow-none select-none"
    >
      {/* 1. Header / Platform Branding */}
      <div className="h-18 lg:h-20 px-6 flex items-center justify-between border-b border-[#262624]">
        <Link to="/studio" className="flex items-center gap-3 group text-decoration-none" aria-label="SHOWCASE Home">
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

      {/* 2. Middle Navigation Items */}
      <SidebarNavLinks user={user} />

      {/* 3. Bottom Section: CTA, Persona, Profile Menu */}
      <div className="p-4 border-t border-[#262624] space-y-3 bg-[#141413]">
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

        <div className="pt-1">
          <DemoSwitcher
            currentPersona={currentPersona}
            onPersonaChange={onPersonaChange}
            className="w-full justify-between bg-[#262624]/60 border border-[#262624] text-[#faf9f5]"
          />
        </div>

        <SidebarUserMenu user={user} onPersonaChange={onPersonaChange} onLogout={onLogout} />
      </div>
    </aside>
  );
};
