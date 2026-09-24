import { ArrowLeft, LayoutGrid } from "lucide-react";
import React, { useEffect } from "react";
import { BrowserRouter, Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Button } from "./shared/components/Button.tsx";
import { AuthProvider, ToastProvider, useAuth } from "./shared/context/index.ts";
import { Footer, MobileBottomNav, MobileTopBar, Sidebar } from "./shared/layout/index.ts";

import {
  CareerAcademicsPage,
  CareerAchievementsPage,
  CareerCredentialsPage,
  CareerExperiencePage,
  CareerHubPage,
  CareerLanguagesPage,
  CareerSkillsPage,
} from "./features/career/pages/index.ts";
import { PostDetailsPage, PostEditorPage, StudioDashboardPage } from "./features/posts/pages/index.ts";
import { ProfileSettingsPage, PublicProfilePage } from "./features/profile/pages/index.ts";
import {
  ActiveSessionsPage,
  ChangePasswordPage,
  DeleteAccountPage,
  SecurityHubPage,
  TwoFactorAuthPage,
  UpdateEmailPage,
} from "./features/security/index.ts";

// Scroll to top on route changes for seamless editorial navigation
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// Main Editorial App Shell with Adaptive Navigation
const AppLayout: React.FC = () => {
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

      {/* 1. Desktop & iPad Fixed Left Sidebar (VSCO Aesthetic) */}
      <Sidebar user={layoutUser} currentPersona={activePersona} onPersonaChange={switchPersona} onLogout={logout} />

      {/* 2. Main Content Canvas (Offset by Sidebar on Desktop, padded for Bottom Nav on Mobile) */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-60 lg:pl-64 transition-all">
        {/* Mobile Top Bar (Centered logo, left +, right notification bell) */}
        <MobileTopBar />

        {/* Primary Dynamic Route View */}
        <main className="flex-1 pb-20 md:pb-0">
          <Routes>
            <Route path="/" element={<StudioDashboardPage />} />
            <Route path="/explore" element={<Navigate to="/studio" replace />} />
            <Route path="/studio" element={<StudioDashboardPage />} />
            <Route path="/posts/mine" element={<StudioDashboardPage />} />
            <Route path="/posts/new" element={<PostEditorPage />} />
            <Route path="/posts/:id/edit" element={<PostEditorPage />} />
            <Route path="/posts/:id" element={<PostDetailsPage />} />
            <Route path="/u/:username" element={<PublicProfilePage />} />
            <Route path="/settings" element={<ProfileSettingsPage />} />
            <Route path="/settings/security" element={<SecurityHubPage />} />
            <Route path="/settings/security/change-password" element={<ChangePasswordPage />} />
            <Route path="/settings/security/email" element={<UpdateEmailPage />} />
            <Route path="/settings/security/two-factor" element={<TwoFactorAuthPage />} />
            <Route path="/settings/security/sessions" element={<ActiveSessionsPage />} />
            <Route path="/settings/security/delete-account" element={<DeleteAccountPage />} />

            {/* Career Hub & Dedicated Sub-pages */}
            <Route path="/career" element={<CareerHubPage />} />
            <Route path="/career/experience" element={<CareerExperiencePage />} />
            <Route path="/career/academics" element={<CareerAcademicsPage />} />
            <Route path="/career/skills" element={<CareerSkillsPage />} />
            <Route path="/career/credentials" element={<CareerCredentialsPage />} />
            <Route path="/career/languages" element={<CareerLanguagesPage />} />
            <Route path="/career/achievements" element={<CareerAchievementsPage />} />

            {/* 404 Editorial View */}
            <Route
              path="*"
              element={
                <div className="max-w-xl mx-auto px-4 py-24 text-center">
                  <div className="inline-flex items-center justify-center p-4 rounded-full bg-[#faf9f5] border border-[#cccbc8]/60 text-[#87867f] mb-6">
                    <LayoutGrid className="h-10 w-10 stroke-[1.5]" />
                  </div>
                  <span className="font-gothic text-xs font-bold uppercase tracking-[0.16em] text-[#87867f] block mb-2">
                    Exhibition Archive &bull; Void
                  </span>
                  <h1 className="font-gothic text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-[#141413]">
                    Page Not Found
                  </h1>
                  <p className="font-serif text-[18px] text-[#141413]/80 mt-4 leading-relaxed">
                    The gallery corridor you attempted to visit does not lead to any cataloged plate or artist
                    portfolio.
                  </p>
                  <div className="mt-8">
                    <Link to="/studio">
                      <Button variant="slate" size="md" leftIcon={<ArrowLeft className="h-4 w-4" />}>
                        Return to Studio
                      </Button>
                    </Link>
                  </div>
                </div>
              }
            />
          </Routes>
        </main>

        {/* Global Understated Footer */}
        <Footer />
      </div>

      {/* 3. Mobile Bottom Navigation Bar (Fixed bottom, icon-only, active state indicator) */}
      <MobileBottomNav user={layoutUser} />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppLayout />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
