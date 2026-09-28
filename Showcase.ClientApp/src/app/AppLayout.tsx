import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@shared/context/index.ts";
import { Footer, MobileBottomNav, MobileTopBar, Sidebar } from "@shared/layout/index.ts";
import { ScrollToTop } from "./ScrollToTop.tsx";

export interface AppLayoutProps {
  children?: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { currentUser, activePersona, switchPersona, logout } = useAuth();
  const location = useLocation();

  const isEditorRoute =
    location.pathname.startsWith("/posts/new") || /^\/posts\/[^/]+\/edit/.test(location.pathname);

  const isStandaloneRoute =
    location.pathname.startsWith("/login") ||
    location.pathname.startsWith("/register") ||
    location.pathname.startsWith("/auth") ||
    location.pathname === "/500" ||
    location.pathname.startsWith("/admin");

  const layoutUser = currentUser
    ? {
        username: currentUser.username,
        name: currentUser.name,
        avatarUrl: currentUser.avatarUrl || undefined,
        isVerified: currentUser.isVerified,
        roles: currentUser.roles,
      }
    : null;

  const content = children ?? <Outlet />;

  if (isStandaloneRoute) {
    return (
      <div className="min-h-screen bg-ivory-medium text-slate-dark antialiased selection:bg-clay selection:text-ivory-light">
        <ScrollToTop />
        <main className="min-h-screen">{content}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-ivory-medium text-slate-dark antialiased selection:bg-clay selection:text-ivory-light">
      <ScrollToTop />
      <Sidebar
        user={layoutUser}
        currentPersona={activePersona}
        onPersonaChange={switchPersona}
        onLogout={logout}
      />
      <div className="flex-1 flex flex-col min-w-0 md:pl-60 lg:pl-64 transition-all">
        <MobileTopBar />
        <main className={`flex-1 ${isEditorRoute ? "" : "pb-16 md:pb-0"}`}>{content}</main>
        <Footer />
      </div>
      {!isEditorRoute && <MobileBottomNav user={layoutUser} />}
    </div>
  );
};
