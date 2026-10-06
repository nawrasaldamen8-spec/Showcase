import React, { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "sonner";
import { NotFoundView } from "@shared/components/NotFoundView.tsx";
import { ProtectedRoute } from "@shared/components/ProtectedRoute.tsx";
import { RouteLoadingSkeleton } from "@shared/components/RouteLoadingSkeleton.tsx";
import { AuthProvider } from "@shared/context/index.ts";

import { AppLayout } from "./AppLayout.tsx";
import { queryClient } from "./queryClient.ts";

// Career Pages
const AcademicFormPage = lazy(() => import("@features/career/pages/AcademicFormPage.tsx").then((m) => ({ default: m.AcademicFormPage })));
const AchievementFormPage = lazy(() => import("@features/career/pages/AchievementFormPage.tsx").then((m) => ({ default: m.AchievementFormPage })));
const CareerAcademicsPage = lazy(() => import("@features/career/pages/CareerAcademicsPage.tsx").then((m) => ({ default: m.CareerAcademicsPage })));
const CareerAchievementsPage = lazy(() => import("@features/career/pages/CareerAchievementsPage.tsx").then((m) => ({ default: m.CareerAchievementsPage })));
const CareerCredentialsPage = lazy(() => import("@features/career/pages/CareerCredentialsPage.tsx").then((m) => ({ default: m.CareerCredentialsPage })));
const CareerExperiencePage = lazy(() => import("@features/career/pages/CareerExperiencePage.tsx").then((m) => ({ default: m.CareerExperiencePage })));
const CareerHubPage = lazy(() => import("@features/career/pages/CareerHubPage.tsx").then((m) => ({ default: m.CareerHubPage })));
const CareerLanguagesPage = lazy(() => import("@features/career/pages/CareerLanguagesPage.tsx").then((m) => ({ default: m.CareerLanguagesPage })));
const CareerSkillsPage = lazy(() => import("@features/career/pages/CareerSkillsPage.tsx").then((m) => ({ default: m.CareerSkillsPage })));
const CredentialFormPage = lazy(() => import("@features/career/pages/CredentialFormPage.tsx").then((m) => ({ default: m.CredentialFormPage })));
const ExperienceFormPage = lazy(() => import("@features/career/pages/ExperienceFormPage.tsx").then((m) => ({ default: m.ExperienceFormPage })));
const LanguageFormPage = lazy(() => import("@features/career/pages/LanguageFormPage.tsx").then((m) => ({ default: m.LanguageFormPage })));
const SkillFormPage = lazy(() => import("@features/career/pages/SkillFormPage.tsx").then((m) => ({ default: m.SkillFormPage })));

// Feed Pages
const FeedPage = lazy(() => import("@features/feed/pages/FeedPage.tsx").then((m) => ({ default: m.FeedPage })));
const SearchResultsPage = lazy(() => import("@features/feed/pages/SearchResultsPage.tsx").then((m) => ({ default: m.SearchResultsPage })));

// Notifications Pages
const NotificationsPage = lazy(() => import("@features/notifications/pages/NotificationsPage.tsx").then((m) => ({ default: m.NotificationsPage })));

// Posts Pages
const PostDetailsPage = lazy(() => import("@features/posts/pages/PostDetailsPage.tsx").then((m) => ({ default: m.PostDetailsPage })));
const PostEditorPage = lazy(() => import("@features/posts/pages/PostEditorPage.tsx").then((m) => ({ default: m.PostEditorPage })));
const StudioDashboardPage = lazy(() => import("@features/posts/pages/StudioDashboardPage.tsx").then((m) => ({ default: m.StudioDashboardPage })));

// Profile Pages
const EditProfilePage = lazy(() => import("@features/profile/pages/EditProfilePage.tsx").then((m) => ({ default: m.EditProfilePage })));
const EditSocialLinksPage = lazy(() => import("@features/profile/pages/EditSocialLinksPage.tsx").then((m) => ({ default: m.EditSocialLinksPage })));
const PublicProfilePage = lazy(() => import("@features/profile/pages/PublicProfilePage.tsx").then((m) => ({ default: m.PublicProfilePage })));
const SelectSpecialtyPage = lazy(() => import("@features/profile/pages/SelectSpecialtyPage.tsx").then((m) => ({ default: m.SelectSpecialtyPage })));
const SelectCountryPage = lazy(() => import("@features/profile/pages/SelectCountryPage.tsx").then((m) => ({ default: m.SelectCountryPage })));

// Security Pages
const ChangePasswordPage = lazy(() => import("@features/security/pages/ChangePasswordPage.tsx").then((m) => ({ default: m.ChangePasswordPage })));
const ChangeUsernamePage = lazy(() => import("@features/security/pages/ChangeUsernamePage.tsx").then((m) => ({ default: m.ChangeUsernamePage })));
const DeleteAccountPage = lazy(() => import("@features/security/pages/DeleteAccountPage.tsx").then((m) => ({ default: m.DeleteAccountPage })));
const FeaturedRequestPage = lazy(() => import("@features/security/pages/FeaturedRequestPage.tsx").then((m) => ({ default: m.FeaturedRequestPage })));
const ManagePhonePage = lazy(() => import("@features/security/pages/ManagePhonePage.tsx").then((m) => ({ default: m.ManagePhonePage })));
const SecurityHubPage = lazy(() => import("@features/security/pages/SecurityHubPage.tsx").then((m) => ({ default: m.SecurityHubPage })));
const UpdateEmailPage = lazy(() => import("@features/security/pages/UpdateEmailPage.tsx").then((m) => ({ default: m.UpdateEmailPage })));
const VerificationRequestPage = lazy(() => import("@features/security/pages/VerificationRequestPage.tsx").then((m) => ({ default: m.VerificationRequestPage })));
const AccountBannedPage = lazy(() => import("@features/security/pages/AccountBannedPage.tsx").then((m) => ({ default: m.AccountBannedPage })));

// Auth Pages
const CompleteOAuthPage = lazy(() => import("@features/auth/pages/CompleteOAuthPage.tsx").then((m) => ({ default: m.CompleteOAuthPage })));
const LoginPage = lazy(() => import("@features/auth/pages/LoginPage.tsx").then((m) => ({ default: m.LoginPage })));
const RegisterWizardPage = lazy(() => import("@features/auth/pages/RegisterWizardPage.tsx").then((m) => ({ default: m.RegisterWizardPage })));

// Admin Pages
const AdminAuditLogsPage = lazy(() => import("@features/admin/pages/AdminAuditLogsPage.tsx").then((m) => ({ default: m.AdminAuditLogsPage })));
const AdminDashboardPage = lazy(() => import("@features/admin/pages/AdminDashboardPage.tsx").then((m) => ({ default: m.AdminDashboardPage })));
const AdminFeaturedPage = lazy(() => import("@features/admin/pages/AdminFeaturedPage.tsx").then((m) => ({ default: m.AdminFeaturedPage })));
const AdminReportsPage = lazy(() => import("@features/admin/pages/AdminReportsPage.tsx").then((m) => ({ default: m.AdminReportsPage })));
const AdminStoragePage = lazy(() => import("@features/admin/pages/AdminStoragePage.tsx").then((m) => ({ default: m.AdminStoragePage })));
const AdminUsersPage = lazy(() => import("@features/admin/pages/AdminUsersPage.tsx").then((m) => ({ default: m.AdminUsersPage })));
const AdminVerificationsPage = lazy(() => import("@features/admin/pages/AdminVerificationsPage.tsx").then((m) => ({ default: m.AdminVerificationsPage })));

// System Pages
const PrivacyPolicyPage = lazy(() => import("@features/system/pages/PrivacyPolicyPage.tsx").then((m) => ({ default: m.PrivacyPolicyPage })));
const ServerErrorPage = lazy(() => import("@features/system/pages/ServerErrorPage.tsx").then((m) => ({ default: m.ServerErrorPage })));
const TermsOfServicePage = lazy(() => import("@features/system/pages/TermsOfServicePage.tsx").then((m) => ({ default: m.TermsOfServicePage })));

export const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<RouteLoadingSkeleton />}>
      <Routes>
        {/* 1. Public Auth & Standalone Pages */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterWizardPage />} />
        <Route path="/auth/complete-oauth" element={<CompleteOAuthPage />} />
        <Route path="/banned" element={<AccountBannedPage />} />

        {/* 2. Public Content Routes with AppLayout (Open to Guests & Users) */}
        <Route element={<AppLayout />}>
          <Route path="/u/:username" element={<PublicProfilePage />} />
          <Route path="/posts/:id" element={<PostDetailsPage />} />
          <Route path="/terms" element={<TermsOfServicePage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
        </Route>

        {/* 3. Protected User Routes with AppLayout */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Navigate to="/studio" replace />} />
          <Route path="/studio" element={<StudioDashboardPage />} />
          <Route path="/posts/mine" element={<StudioDashboardPage />} />
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/feed/search" element={<SearchResultsPage />} />
          <Route path="/search" element={<SearchResultsPage />} />
          <Route path="/explore" element={<Navigate to="/feed" replace />} />

          {/* Post Management */}
          <Route path="/posts/new" element={<PostEditorPage />} />
          <Route path="/posts/:id/edit" element={<PostEditorPage />} />

          {/* Profiles Management */}
          <Route path="/profile/edit" element={<EditProfilePage />} />
          <Route path="/profile/edit/specialty" element={<SelectSpecialtyPage />} />
          <Route path="/profile/edit/country" element={<SelectCountryPage />} />
          <Route path="/profile/social-links" element={<EditSocialLinksPage />} />

          {/* Notifications */}
          <Route path="/notifications" element={<NotificationsPage />} />

          {/* Settings Nested Routes */}
          <Route path="/settings">
            <Route index element={<SecurityHubPage />} />
            <Route path="profile" element={<Navigate to="/profile/edit" replace />} />
            <Route path="featured" element={<Navigate to="/settings/security/featured" replace />} />
            <Route path="verification" element={<Navigate to="/settings/security/verification" replace />} />
            <Route path="security" element={<SecurityHubPage />} />
            <Route path="security/username" element={<ChangeUsernamePage />} />
            <Route path="security/email" element={<UpdateEmailPage />} />
            <Route path="security/phone" element={<ManagePhonePage />} />
            <Route path="security/change-password" element={<ChangePasswordPage />} />
            <Route path="security/verification" element={<VerificationRequestPage />} />
            <Route path="security/featured" element={<FeaturedRequestPage />} />
            <Route path="security/delete-account" element={<DeleteAccountPage />} />
            <Route path="security/two-factor" element={<Navigate to="/settings/security" replace />} />
            <Route path="security/sessions" element={<Navigate to="/settings/security" replace />} />
          </Route>

          {/* Career Nested Routes */}
          <Route path="/career">
            <Route index element={<CareerHubPage />} />
            <Route path="experience" element={<CareerExperiencePage />} />
            <Route path="experience/new" element={<ExperienceFormPage />} />
            <Route path="experience/:id/edit" element={<ExperienceFormPage />} />
            <Route path="academics" element={<CareerAcademicsPage />} />
            <Route path="academics/new" element={<AcademicFormPage />} />
            <Route path="academics/:id/edit" element={<AcademicFormPage />} />
            <Route path="skills" element={<CareerSkillsPage />} />
            <Route path="skills/new" element={<SkillFormPage />} />
            <Route path="skills/:id/edit" element={<SkillFormPage />} />
            <Route path="credentials" element={<CareerCredentialsPage />} />
            <Route path="credentials/new" element={<CredentialFormPage />} />
            <Route path="credentials/:id/edit" element={<CredentialFormPage />} />
            <Route path="languages" element={<CareerLanguagesPage />} />
            <Route path="languages/new" element={<LanguageFormPage />} />
            <Route path="languages/:id/edit" element={<LanguageFormPage />} />
            <Route path="achievements" element={<CareerAchievementsPage />} />
            <Route path="achievements/new" element={<AchievementFormPage />} />
            <Route path="achievements/:id/edit" element={<AchievementFormPage />} />
          </Route>
        </Route>

        {/* 4. Protected Admin Console Routes */}
        <Route path="/admin">
          <Route index element={<AdminDashboardPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="verifications" element={<AdminVerificationsPage />} />
          <Route path="reports" element={<AdminReportsPage />} />
          <Route path="featured" element={<AdminFeaturedPage />} />
          <Route path="storage" element={<AdminStoragePage />} />
          <Route path="audit-logs" element={<AdminAuditLogsPage />} />
        </Route>

        {/* 5. System Error & 404 */}
        <Route path="/500" element={<ServerErrorPage />} />
        <Route path="*" element={<NotFoundView />} />
      </Routes>
    </Suspense>
  );
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
          <Toaster position="top-right" richColors closeButton />
        </AuthProvider>
      </BrowserRouter>
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
};

export default App;
