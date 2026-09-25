import React from "react";
import { useAuth } from "@shared/context/index.ts";
import { Footer, MobileBottomNav, MobileTopBar, Sidebar } from "@shared/layout/index.ts";
import { ScrollToTop } from "./ScrollToTop.tsx";

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { currentUser, activePersona, switchPersona, logout } = useAuth();

  const layoutUser = currentUser
    ? {
        username: currentUser.username,
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        avatarUrl: currentUser.avatarUrl || undefined,
      }
    : null;

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
        <main className="flex-1 pb-20 md:pb-0">{children}</main>
        <Footer />
      </div>
      <MobileBottomNav user={layoutUser} />
    </div>
  );
};
