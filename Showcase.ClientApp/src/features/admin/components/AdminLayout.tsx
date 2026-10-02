import React from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Database,
  FileCheck,
  History,
  LayoutDashboard,
  Shield,
  ShieldAlert,
  Sparkles,
  Users,
} from "lucide-react";
import { AdminRouteGuard } from "./AdminRouteGuard.tsx";

export interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  headerAction?: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  title,
  subtitle,
  headerAction,
}) => {
  const location = useLocation();

  interface AdminNavItem {
    label: string;
    to: string;
    icon: React.ComponentType<{ className?: string }>;
    exact?: boolean;
    badge?: number;
    badgeColor?: string;
  }

  const navItems: AdminNavItem[] = [
    { label: "Overview", to: "/admin", icon: LayoutDashboard, exact: true },
    { label: "Users", to: "/admin/users", icon: Users },
    { label: "Verifications", to: "/admin/verifications", icon: FileCheck },
    { label: "Reports", to: "/admin/reports", icon: ShieldAlert },
    { label: "Curated / Featured", to: "/admin/featured", icon: Sparkles },
    { label: "Media Storage", to: "/admin/storage", icon: Database },
    { label: "Audit Logs", to: "/admin/audit-logs", icon: History },
  ];

  return (
    <AdminRouteGuard>
      <div className="min-h-screen bg-ivory-medium text-slate-dark pb-24">
        {/* Top Dark Governance Bar */}
        <header className="bg-slate-dark text-ivory-light border-b border-[#262624] px-4 sm:px-8 py-3.5 sticky top-0 z-30 shadow-none">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-clay flex items-center justify-center text-ivory-light">
                <Shield className="w-4 h-4" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-gothic text-sm font-extrabold uppercase tracking-wider text-ivory-light">
                  Pority Console
                </span>
                <span className="text-cloud-dark text-xs font-serif hidden sm:inline">&bull; System Administration</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/studio"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#262624] hover:bg-[#333330] text-ivory-light font-gothic text-xs font-bold uppercase tracking-wider transition-colors text-decoration-none"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Exit to Studio</span>
                <span className="sm:hidden">Studio</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Horizontal Navigation Tabs */}
        <div className="bg-ivory-light border-b border-stone px-4 sm:px-8 sticky top-13 z-20 overflow-x-auto no-scrollbar">
          <div className="max-w-7xl mx-auto flex items-center gap-1 min-w-max py-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact
                ? location.pathname === item.to
                : location.pathname.startsWith(item.to);

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl font-gothic text-xs font-bold uppercase tracking-[0.10em] transition-all text-decoration-none ${
                    isActive
                      ? "bg-slate-dark text-ivory-light shadow-none"
                      : "text-cloud-dark hover:text-slate-dark hover:bg-[#e8e5dc]/60"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-gothic font-extrabold ${
                        item.badgeColor || "bg-clay text-ivory-light"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>

        {/* Page Content Container */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 space-y-6">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone pb-5">
            <div>
              <h1 className="font-gothic font-extrabold text-2xl sm:text-3xl uppercase tracking-tight text-slate-dark">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-1 font-serif text-sm text-slate-dark/70 leading-relaxed">
                  {subtitle}
                </p>
              )}
            </div>

            {headerAction && <div className="shrink-0">{headerAction}</div>}
          </div>

          {/* Body */}
          <div>{children}</div>
        </main>
      </div>
    </AdminRouteGuard>
  );
};
