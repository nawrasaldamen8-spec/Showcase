import {
  ExternalLink,
  LogOut,
  Menu,
  Plus,
  Settings as SettingsIcon,
  Sparkles,
  User as UserIcon,
  X,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Button } from "../components/Button";
import { DemoSwitcher, type DemoPersona } from "./DemoSwitcher";

export interface NavbarUser {
  username: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
}

export interface NavbarProps {
  user?: NavbarUser | null;
  currentPersona?: DemoPersona;
  onPersonaChange?: (persona: DemoPersona) => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, currentPersona, onPersonaChange, onLogout }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

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

  const location = useLocation();

  const isLinkActive = (to: string, isActive: boolean) => {
    if (isActive) return true;
    if (to === "/explore" && location.pathname === "/") return true;
    if (to === "/studio" && location.pathname === "/posts/mine") return true;
    return false;
  };

  const navLinks =
    currentPersona === "visitor"
      ? [{ label: "Explore", to: "/explore" }]
      : [
          { label: "Explore", to: "/explore" },
          { label: "Studio", to: "/studio" },
          { label: "Settings", to: "/settings" },
        ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#faf9f5]/95 backdrop-blur-md border-b border-[#cccbc8] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between gap-4">
        {/* Left: Brand & Primary Nav */}
        <div className="flex items-center gap-8 lg:gap-12">
          <Link
            to="/explore"
            className="flex items-center gap-2 group select-none text-decoration-none"
            aria-label="SHOWCASE Home"
          >
            <span className="font-gothic font-extrabold text-xl sm:text-2xl tracking-[0.16em] uppercase text-[#141413] transition-colors group-hover:text-[#d97757]">
              SHOWCASE
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8" aria-label="Main Navigation">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `font-gothic text-[13px] font-semibold uppercase tracking-[0.10em] py-2 transition-all border-b-2 ${
                    isLinkActive(link.to, isActive)
                      ? "text-[#141413] border-[#141413]"
                      : "text-[#87867f] border-transparent hover:text-[#141413] hover:border-[#cccbc8]"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Right: Demo Switcher, CTA, Profile Menu, Mobile Hamburger */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Demo Persona Switcher */}
          <DemoSwitcher
            currentPersona={currentPersona}
            onPersonaChange={onPersonaChange}
            className="hidden sm:inline-flex"
          />

          {/* "+ New Post" CTA Pill */}
          <Link to="/posts/new" className="text-decoration-none">
            <Button variant="clay" size="sm" leftIcon={<Plus className="h-4 w-4" />} className="hidden sm:inline-flex">
              New Post
            </Button>
          </Link>

          {/* User Profile Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              type="button"
              onClick={() => setUserMenuOpen((prev) => !prev)}
              aria-expanded={userMenuOpen}
              aria-haspopup="true"
              aria-label="Open user profile menu"
              className="flex items-center gap-2 p-1 rounded-full border border-[#cccbc8] bg-[#faf9f5] hover:border-[#141413] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#141413]"
            >
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.username || "User avatar"}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-[#141413] text-[#faf9f5] flex items-center justify-center font-gothic text-xs font-bold uppercase">
                  {user?.firstName?.[0] || user?.username?.[0] || <UserIcon className="h-4 w-4" />}
                </div>
              )}
            </button>

            {/* Profile Dropdown */}
            {userMenuOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-56 bg-[#faf9f5] border border-[#cccbc8] rounded-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
              >
                {user ? (
                  <>
                    <div className="px-4 py-2.5 border-b border-[#cccbc8]/60">
                      <p className="font-gothic text-xs font-semibold uppercase tracking-wider text-[#141413] truncate">
                        {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username}
                      </p>
                      <p className="font-serif text-xs text-[#87867f] truncate">@{user.username}</p>
                    </div>

                    <div className="py-1">
                      <Link
                        to={`/u/${user.username}`}
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm font-serif text-[#141413] hover:bg-[#e8e5dc]/60 transition-colors"
                        role="menuitem"
                      >
                        <ExternalLink className="h-4 w-4 text-[#87867f]" />
                        <span>View Public Profile</span>
                      </Link>

                      <Link
                        to="/studio"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm font-serif text-[#141413] hover:bg-[#e8e5dc]/60 transition-colors"
                        role="menuitem"
                      >
                        <Plus className="h-4 w-4 text-[#87867f]" />
                        <span>Creator Studio</span>
                      </Link>

                      <Link
                        to="/settings"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm font-serif text-[#141413] hover:bg-[#e8e5dc]/60 transition-colors"
                        role="menuitem"
                      >
                        <SettingsIcon className="h-4 w-4 text-[#87867f]" />
                        <span>Account Settings</span>
                      </Link>
                    </div>

                    {onLogout && (
                      <div className="border-t border-[#cccbc8]/60 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setUserMenuOpen(false);
                            onLogout();
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-sm font-serif text-[#d97757] hover:bg-[#e8e5dc]/60 transition-colors text-left cursor-pointer"
                          role="menuitem"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="px-4 py-2.5 border-b border-[#cccbc8]/60">
                      <p className="font-gothic text-xs font-semibold uppercase tracking-wider text-[#141413] truncate">
                        Guest Visitor
                      </p>
                      <p className="font-serif text-xs text-[#87867f] truncate">Browsing public gallery</p>
                    </div>

                    <div className="py-1">
                      <button
                        type="button"
                        onClick={() => {
                          setUserMenuOpen(false);
                          onPersonaChange?.("creator");
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-sm font-serif text-[#141413] hover:bg-[#e8e5dc]/60 transition-colors text-left cursor-pointer"
                        role="menuitem"
                      >
                        <Sparkles className="h-4 w-4 text-[#d97757]" />
                        <span>Switch to Creator</span>
                      </button>
                      <Link
                        to="/explore"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm font-serif text-[#141413] hover:bg-[#e8e5dc]/60 transition-colors"
                        role="menuitem"
                      >
                        <ExternalLink className="h-4 w-4 text-[#87867f]" />
                        <span>Explore Feed</span>
                      </Link>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle mobile menu"
            className="md:hidden p-2 text-[#141413] hover:bg-[#cccbc8]/30 rounded-lg transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer / Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#cccbc8] bg-[#faf9f5] px-4 pt-4 pb-6 space-y-4">
          {/* Mobile Demo Persona Switcher */}
          <div className="flex items-center justify-between pb-2 border-b border-[#cccbc8]/50">
            <span className="font-gothic text-xs uppercase tracking-widest text-[#87867f]">Persona</span>
            <DemoSwitcher currentPersona={currentPersona} onPersonaChange={onPersonaChange} />
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `font-gothic text-sm font-semibold uppercase tracking-[0.10em] py-2 px-3 rounded-lg transition-colors ${
                    isLinkActive(link.to, isActive)
                      ? "bg-[#141413] text-[#faf9f5]"
                      : "text-[#87867f] hover:text-[#141413] hover:bg-[#e8e5dc]/50"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Mobile New Post Button */}
          <div className="pt-2">
            <Link to="/posts/new" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="clay" size="md" fullWidth leftIcon={<Plus className="h-4 w-4" />}>
                New Post
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
