import React from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { LogOut, Mail, ShieldAlert } from "lucide-react";
import { Button } from "@shared/components/Button.tsx";
import { BrandLogo } from "@shared/components/BrandLogo.tsx";
import { useAuth } from "@shared/context/index.ts";

export const AccountBannedPage: React.FC = () => {
  const { currentUser, isAuthenticated, isLoading, logout } = useAuth();
  const navigate = useNavigate();

  // If user is not authenticated, redirect to login
  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If user is authenticated but not banned, redirect to feed
  if (!isLoading && isAuthenticated && !currentUser?.isBanned) {
    return <Navigate to="/feed" replace />;
  }

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const username = currentUser?.username || "user";
  const banReason = currentUser?.banReason || "Violation of platform community guidelines and policies.";

  return (
    <div className="min-h-screen bg-ivory-medium flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Platform Logo */}
      <div className="mb-8">
        <BrandLogo size="md" />
      </div>

      {/* Main Suspension Card */}
      <div className="w-full max-w-lg bg-ivory-light border border-stone/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        {/* Header with Alert Icon */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-600">
            <ShieldAlert className="w-8 h-8 stroke-[1.75]" />
          </div>
          
          <div className="space-y-1">
            <span className="font-gothic text-[11px] font-bold uppercase tracking-[0.2em] text-red-600">
              Account Suspended
            </span>
            <h1 className="font-gothic text-xl sm:text-2xl font-bold uppercase tracking-tight text-slate-dark">
              Access Restricted
            </h1>
          </div>
        </div>

        {/* User Badge */}
        <div className="p-3.5 rounded-2xl bg-ivory-medium/60 border border-stone/60 flex items-center justify-between">
          <div className="min-w-0">
            <p className="font-serif text-xs text-cloud-dark">Affected Account</p>
            <p className="font-gothic text-sm font-bold text-slate-dark truncate">
              @{username}
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-red-600 text-white font-gothic text-[10px] font-bold uppercase tracking-wider">
            Suspended
          </span>
        </div>

        {/* Rationale & Policy Notice */}
        <div className="space-y-2">
          <label className="font-gothic text-xs font-bold uppercase tracking-wider text-slate-dark block">
            Reason for Suspension
          </label>
          <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/20 font-serif text-sm text-slate-dark leading-relaxed">
            {banReason}
          </div>
          <p className="font-serif text-xs text-cloud-dark leading-relaxed pt-1">
            While your account is suspended, you cannot publish portfolio works, interact with the community, or make account modifications.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 space-y-3">
          <Button
            type="button"
            variant="slate"
            size="lg"
            onClick={handleLogout}
            leftIcon={<LogOut className="w-4 h-4" />}
            className="w-full justify-center"
          >
            Sign Out
          </Button>

          <a
            href="mailto:support@showcase.local?subject=Account%20Suspension%20Appeal"
            className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl border border-stone/80 text-cloud-dark font-gothic text-xs font-bold uppercase tracking-wider hover:text-slate-dark hover:border-slate-dark transition-colors text-decoration-none"
          >
            <Mail className="w-4 h-4" />
            <span>Contact Support / Appeal</span>
          </a>
        </div>
      </div>

      {/* Footer Note */}
      <p className="mt-8 font-serif text-xs text-cloud-dark/80 text-center max-w-sm">
        If you believe this suspension is a mistake, please reach out with your username and details.
      </p>
    </div>
  );
};
