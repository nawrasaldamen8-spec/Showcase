import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { NotFoundView } from "@shared/components/NotFoundView.tsx";
import { AuthProvider, ToastProvider } from "@shared/context/index.ts";
import { AppLayout } from "./AppLayout.tsx";

import {
  CareerAcademicsPage,
  CareerAchievementsPage,
  CareerCredentialsPage,
  CareerExperiencePage,
  CareerHubPage,
  CareerLanguagesPage,
  CareerSkillsPage,
} from "@features/career/pages/index.ts";
import {
  PostDetailsPage,
  PostEditorPage,
  StudioDashboardPage,
} from "@features/posts/pages/index.ts";
import {
  ProfileSettingsPage,
  PublicProfilePage,
} from "@features/profile/pages/index.ts";
import {
  ActiveSessionsPage,
  ChangePasswordPage,
  DeleteAccountPage,
  SecurityHubPage,
  TwoFactorAuthPage,
  UpdateEmailPage,
} from "@features/security/index.ts";

export const AppRoutes: React.FC = () => {
  return (
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

      {/* Career Hub and Dedicated Sub-pages */}
      <Route path="/career" element={<CareerHubPage />} />
      <Route path="/career/experience" element={<CareerExperiencePage />} />
      <Route path="/career/academics" element={<CareerAcademicsPage />} />
      <Route path="/career/skills" element={<CareerSkillsPage />} />
      <Route path="/career/credentials" element={<CareerCredentialsPage />} />
      <Route path="/career/languages" element={<CareerLanguagesPage />} />
      <Route path="/career/achievements" element={<CareerAchievementsPage />} />

      {/* 404 Editorial View */}
      <Route path="*" element={<NotFoundView />} />
    </Routes>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppLayout>
            <AppRoutes />
          </AppLayout>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
