import React from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@shared/context/index.ts";
import { Footer, MobileBottomNav, MobileTopBar, Sidebar } from "@shared/layout/index.ts";
import { ScrollToTop } from "./ScrollToTop.tsx";

interface AppLayoutProps {
  children: React.ReactNode;
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
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        avatarUrl: currentUser.avatarUrl || undefined,
        isVerified: currentUser.isVerified,
        roles: currentUser.roles,
      }
    : null;

  if (isStandaloneRoute) {
    return (
      <div className="min-h-screen bg-[#f0eee6] text-[#141413] antialiased selection:bg-[#d97757] selection:text-[#faf9f5]">
        <ScrollToTop />
        <main className="min-h-screen">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#f0eee6] text-[#141413] antialiased selection:bg-[#d97757] selection:text-[#faf9f5]">
      <ScrollToTop />
      <Sidebar
        user={layoutUser}
        currentPersona={activePersona}
        onPersonaChange={switchPersona}
        onLogout={logout}
      />
      <div className="flex-1 flex flex-col min-w-0 md:pl-60 lg:pl-64 transition-all">
        <MobileTopBar />
        <main className={`flex-1 ${isEditorRoute ? "" : "pb-16 md:pb-0"}`}>{children}</main>
        <Footer />
      </div>
      {!isEditorRoute && <MobileBottomNav user={layoutUser} />}
    </div>
  );
};
