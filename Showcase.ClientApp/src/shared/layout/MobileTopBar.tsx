import { Bell, LogOut, Settings } from "lucide-react";
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { BrandLogo } from "@shared/components/BrandLogo.tsx";
import { Button } from "@shared/components/Button.tsx";
import { Modal } from "@shared/components/Modal.tsx";
import { useAuth } from "../context/index.ts";

export const MobileTopBar: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const isProfilePage = location.pathname.startsWith("/u/") || location.pathname.startsWith("/profile");

  const handleConfirmLogout = () => {
    setShowLogoutConfirm(false);
    logout();
  };

  return (
    <>
      <header
        aria-label="Mobile Top Bar"
        className="md:hidden sticky top-0 z-30 h-14 bg-ivory-light/95 backdrop-blur-md border-b border-stone/60 px-3 flex items-center justify-between shadow-none select-none transition-colors"
      >
        {/* Left: Sign Out */}
        {currentUser ? (
          <button
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            aria-label="Sign Out"
            title="Sign Out"
            className="flex items-center justify-center h-9 w-9 rounded-xl text-clay hover:bg-clay/10 active:scale-95 transition-all cursor-pointer"
          >
            <LogOut className="h-4.5 w-4.5 stroke-[1.8]" />
          </button>
        ) : (
          <div className="w-9" />
        )}

        {/* Center: Platform Branding */}
        <Link
          to="/studio"
          className="inline-flex items-center text-decoration-none group"
          aria-label="Pority Home"
        >
          <BrandLogo variant="wordmark" size="sm" />
        </Link>

        {/* Right: Conditional Action (Settings on Profile, Notifications elsewhere) */}
        {isProfilePage ? (
          <Link
            to="/settings"
            aria-label="Account Settings"
            title="Account Settings"
            className="flex items-center justify-center h-9 w-9 rounded-xl text-slate-dark hover:bg-[#e8e5dc]/70 active:scale-95 transition-all cursor-pointer"
          >
            <Settings className="h-5 w-5 stroke-[1.8]" />
          </Link>
        ) : (
          <Link
            to="/notifications"
            aria-label="Notifications"
            title="Notifications"
            className="flex items-center justify-center h-9 w-9 rounded-xl text-slate-dark hover:bg-[#e8e5dc]/70 active:scale-95 transition-all cursor-pointer"
          >
            <Bell className="h-5 w-5 stroke-[1.8]" />
          </Link>
        )}
      </header>

      {/* Mobile Logout Confirmation Modal */}
      <Modal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        title="Sign Out Confirmation"
        size="sm"
      >
        <div className="space-y-4">
          <p className="font-serif text-sm text-slate-dark/80">
            Are you sure you want to sign out of your account?
          </p>
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowLogoutConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="clay"
              size="sm"
              onClick={handleConfirmLogout}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
