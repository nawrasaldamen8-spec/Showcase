import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { NotFoundView } from "@shared/components/NotFoundView.tsx";
import { AuthProvider, ToastProvider } from "@shared/context/index.ts";
import { AppLayout } from "./AppLayout.tsx";

import {
  AcademicFormPage,
  AchievementFormPage,
  CareerAcademicsPage,
  CareerAchievementsPage,
  CareerCredentialsPage,
  CareerExperiencePage,
  CareerHubPage,
  CareerLanguagesPage,
  CareerSkillsPage,
  CredentialFormPage,
  ExperienceFormPage,
  LanguageFormPage,
  SkillFormPage,
} from "@features/career/pages/index.ts";
import { FeedPage, SearchResultsPage } from "@features/feed/index.ts";
import { NotificationsPage } from "@features/notifications/index.ts";
import {
  PostDetailsPage,
  PostEditorPage,
  StudioDashboardPage,
} from "@features/posts/pages/index.ts";
import {
  EditProfilePage,
  EditSocialLinksPage,
  PublicProfilePage,
} from "@features/profile/pages/index.ts";
import {
  ChangePasswordPage,
  ChangeUsernamePage,
  DeleteAccountPage,
  ManagePhonePage,
  SecurityHubPage,
  UpdateEmailPage,
  VerificationRequestPage,
  FeaturedRequestPage,
} from "@features/security/index.ts";
import {
  CompleteOAuthPage,
  LoginPage,
  RegisterWizardPage,
} from "@features/auth/index.ts";
import {
  AdminAuditLogsPage,
  AdminBroadcastsPage,
  AdminDashboardPage,
  AdminFeaturedPage,
  AdminReportsPage,
  AdminStoragePage,
  AdminUsersPage,
  AdminVerificationsPage,
} from "@features/admin/index.ts";
import {
  PrivacyPolicyPage,
  ServerErrorPage,
  TermsOfServicePage,
} from "@features/system/index.ts";

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<StudioDashboardPage />} />
      <Route path="/explore" element={<Navigate to="/feed" replace />} />
      <Route path="/feed" element={<FeedPage />} />
      <Route path="/feed/search" element={<SearchResultsPage />} />
      <Route path="/search" element={<SearchResultsPage />} />
      <Route path="/studio" element={<StudioDashboardPage />} />
      <Route path="/posts/mine" element={<StudioDashboardPage />} />
      <Route path="/posts/new" element={<PostEditorPage />} />
      <Route path="/posts/:id/edit" element={<PostEditorPage />} />
      <Route path="/posts/:id" element={<PostDetailsPage />} />
      <Route path="/u/:username" element={<PublicProfilePage />} />
      <Route path="/notifications" element={<NotificationsPage />} />

      {/* Dedicated Profile & Social Editing Routes */}
      <Route path="/profile/edit" element={<EditProfilePage />} />
      <Route path="/profile/social-links" element={<EditSocialLinksPage />} />
      <Route path="/settings/profile" element={<Navigate to="/profile/edit" replace />} />

      {/* Account Settings (Security Hub) & Sub-pages */}
      <Route path="/settings" element={<SecurityHubPage />} />
      <Route path="/settings/security" element={<SecurityHubPage />} />
      <Route path="/settings/security/username" element={<ChangeUsernamePage />} />
      <Route path="/settings/security/email" element={<UpdateEmailPage />} />
      <Route path="/settings/security/phone" element={<ManagePhonePage />} />
      <Route path="/settings/security/change-password" element={<ChangePasswordPage />} />
      <Route path="/settings/security/verification" element={<VerificationRequestPage />} />
      <Route path="/settings/security/featured" element={<FeaturedRequestPage />} />
      <Route path="/settings/security/delete-account" element={<DeleteAccountPage />} />
      <Route path="/settings/security/two-factor" element={<Navigate to="/settings/security" replace />} />
      <Route path="/settings/security/sessions" element={<Navigate to="/settings/security" replace />} />

      {/* Authentication & Onboarding Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterWizardPage />} />
      <Route path="/auth/complete-oauth" element={<CompleteOAuthPage />} />

      {/* Admin Console & Governance Routes */}
      <Route path="/admin" element={<AdminDashboardPage />} />
      <Route path="/admin/users" element={<AdminUsersPage />} />
      <Route path="/admin/verifications" element={<AdminVerificationsPage />} />
      <Route path="/admin/reports" element={<AdminReportsPage />} />
      <Route path="/admin/featured" element={<AdminFeaturedPage />} />
      <Route path="/admin/storage" element={<AdminStoragePage />} />
      <Route path="/admin/audit-logs" element={<AdminAuditLogsPage />} />
      <Route path="/admin/broadcasts" element={<AdminBroadcastsPage />} />

      {/* Legal & System Error Routes */}
      <Route path="/terms" element={<TermsOfServicePage />} />
      <Route path="/privacy" element={<PrivacyPolicyPage />} />
      <Route path="/500" element={<ServerErrorPage />} />

      {/* Career Hub and Dedicated Sub-pages */}
      <Route path="/career" element={<CareerHubPage />} />
      
      {/* Experience List & Dedicated Form Screens */}
      <Route path="/career/experience" element={<CareerExperiencePage />} />
      <Route path="/career/experience/new" element={<ExperienceFormPage />} />
      <Route path="/career/experience/:id/edit" element={<ExperienceFormPage />} />

      {/* Academics List & Dedicated Form Screens */}
      <Route path="/career/academics" element={<CareerAcademicsPage />} />
      <Route path="/career/academics/new" element={<AcademicFormPage />} />
      <Route path="/career/academics/:id/edit" element={<AcademicFormPage />} />

      {/* Skills List & Dedicated Form Screens */}
      <Route path="/career/skills" element={<CareerSkillsPage />} />
      <Route path="/career/skills/new" element={<SkillFormPage />} />
      <Route path="/career/skills/:id/edit" element={<SkillFormPage />} />

      {/* Credentials List & Dedicated Form Screens */}
      <Route path="/career/credentials" element={<CareerCredentialsPage />} />
      <Route path="/career/credentials/new" element={<CredentialFormPage />} />
      <Route path="/career/credentials/:id/edit" element={<CredentialFormPage />} />

      {/* Languages List & Dedicated Form Screens */}
      <Route path="/career/languages" element={<CareerLanguagesPage />} />
      <Route path="/career/languages/new" element={<LanguageFormPage />} />
      <Route path="/career/languages/:id/edit" element={<LanguageFormPage />} />

      {/* Achievements List & Dedicated Form Screens */}
      <Route path="/career/achievements" element={<CareerAchievementsPage />} />
      <Route path="/career/achievements/new" element={<AchievementFormPage />} />
      <Route path="/career/achievements/:id/edit" element={<AchievementFormPage />} />

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
