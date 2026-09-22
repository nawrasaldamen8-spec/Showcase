import { ArrowLeft, Compass } from "lucide-react";
import React, { useEffect } from "react";
import { BrowserRouter, Link, Route, Routes, useLocation } from "react-router-dom";
import { ExplorePage } from "./features/explore/pages/ExplorePage.tsx";
import { PostDetailsPage, PostEditorPage, StudioDashboardPage } from "./features/posts/pages/index.ts";
import { ProfileSettingsPage, PublicProfilePage } from "./features/profile/pages/index.ts";
import { Button } from "./shared/components/Button.tsx";
import { AuthProvider, ToastProvider, useAuth } from "./shared/context/index.ts";
import { Footer, Navbar } from "./shared/layout/index.ts";

// Scroll to top on route changes for seamless editorial navigation
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// Main Editorial App Shell
const AppLayout: React.FC = () => {
  const { currentUser, activePersona, switchPersona, logout } = useAuth();

  const navbarUser = currentUser
    ? {
        username: currentUser.username,
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        avatarUrl: currentUser.avatarUrl || undefined,
      }
    : null;

  return (
    <div className="min-h-screen flex flex-col bg-[#f0eee6] text-[#141413] antialiased selection:bg-[#d97757] selection:text-[#faf9f5]">
      <ScrollToTop />

      {/* Global Editorial Navbar */}
      <Navbar user={navbarUser} currentPersona={activePersona} onPersonaChange={switchPersona} onLogout={logout} />

      {/* Primary Dynamic Route View */}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<ExplorePage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/studio" element={<StudioDashboardPage />} />
          <Route path="/posts/mine" element={<StudioDashboardPage />} />
          <Route path="/posts/new" element={<PostEditorPage />} />
          <Route path="/posts/:id/edit" element={<PostEditorPage />} />
          <Route path="/posts/:id" element={<PostDetailsPage />} />
          <Route path="/u/:username" element={<PublicProfilePage />} />
          <Route path="/settings" element={<ProfileSettingsPage />} />

          {/* 404 Editorial View */}
          <Route
            path="*"
            element={
              <div className="max-w-xl mx-auto px-4 py-24 text-center">
                <div className="inline-flex items-center justify-center p-4 rounded-full bg-[#faf9f5] border border-[#cccbc8]/60 text-[#87867f] mb-6">
                  <Compass className="h-10 w-10 stroke-[1.5]" />
                </div>
                <span className="font-gothic text-xs font-bold uppercase tracking-[0.16em] text-[#87867f] block mb-2">
                  Exhibition Archive &bull; Void
                </span>
                <h1 className="font-gothic text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-[#141413]">
                  Page Not Found
                </h1>
                <p className="font-serif text-[18px] text-[#141413]/80 mt-4 leading-relaxed">
                  The gallery corridor you attempted to visit does not lead to any cataloged plate or artist portfolio.
                </p>
                <div className="mt-8">
                  <Link to="/explore">
                    <Button variant="slate" size="md" leftIcon={<ArrowLeft className="h-4 w-4" />}>
                      Return to Explore Feed
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
