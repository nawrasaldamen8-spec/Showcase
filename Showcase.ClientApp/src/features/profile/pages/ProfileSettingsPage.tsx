import { AlertCircle, ArrowLeft, Compass, ExternalLink, UserCheck } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@shared/components/Button.tsx";
import { Skeleton } from "@shared/components/Skeleton.tsx";
import { VisitorGuard } from "@shared/components/VisitorGuard.tsx";
import type { SocialLinkDto } from "@shared/types/index.ts";
import { AvatarUploader } from "../components/AvatarUploader.tsx";
import { BioEditor } from "../components/BioEditor.tsx";
import { SecuritySettingsTab } from "../components/SecuritySettingsTab.tsx";
import { SocialLinksManager } from "../components/SocialLinksManager.tsx";
import { useProfileSettings, type SettingsTab } from "../hooks/useProfileSettings.ts";

export type { SettingsTab };

const TABS: { id: SettingsTab; label: string }[] = [
  { id: "details", label: "Profile Details" },
  { id: "links", label: "Social Links" },
  { id: "security", label: "Account Security" },
];

export const ProfileSettingsPage: React.FC = () => {
  const {
    activePersona,
    switchPersona,
    activeTab,
    setActiveTab,
    profile,
    setProfile,
    isLoading,
    error,
    loadProfile,
    triggerToast,
  } = useProfileSettings();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative min-h-[80vh]">
      <nav className="mb-8" aria-label="Breadcrumb navigation">
        <Link
          to="/studio"
          className="inline-flex items-center gap-2 font-gothic text-xs font-semibold uppercase tracking-[0.12em] text-[#87867f] hover:text-[#141413] transition-colors group"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
          <span>Creator Studio</span>
        </Link>
      </nav>

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#cccbc8] pb-8 mb-8">
        <div>
          <h1 className="font-gothic font-extrabold text-3xl sm:text-5xl text-[#141413] tracking-[-0.03em] uppercase">
            Settings &amp; Profile
          </h1>
        </div>

        {profile && (
          <div className="shrink-0">
            <Link to={`/u/${profile.username}`} className="text-decoration-none">
              <Button variant="outline" size="md" rightIcon={<ExternalLink className="h-3.5 w-3.5" />}>
                View Public Profile
              </Button>
            </Link>
          </div>
        )}
      </header>

      {activePersona === "visitor" ? (
        <div className="bg-[#faf9f5] rounded-[24px] border border-[#cccbc8]/60 p-8 sm:p-12 text-center max-w-2xl mx-auto my-12">
          <VisitorGuard
            icon={Compass}
            eyebrow="Persona Restriction"
            title="Currently Browsing as Visitor"
            description="The profile customization workspace is exclusive to active Creators. Switch personas to configure your biography, upload avatars, and manage external archives."
            onSwitchPersona={() => switchPersona("creator")}
            secondaryAction={null}
          />
        </div>
      ) : isLoading ? (
        <div className="space-y-8" aria-busy="true">
          <div className="flex gap-8 border-b border-[#cccbc8]/60 pb-3">
            <Skeleton variant="text" width={120} height={20} />
            <Skeleton variant="text" width={100} height={20} />
            <Skeleton variant="text" width={140} height={20} />
          </div>

          <div className="bg-[#faf9f5] rounded-[24px] border border-[#cccbc8]/60 p-8">
            <div className="flex items-center gap-6">
              <Skeleton variant="circular" width={112} height={112} />
              <div className="flex-1 space-y-3">
                <Skeleton variant="text" width="40%" height={24} />
                <Skeleton variant="text" width="70%" height={16} />
                <Skeleton variant="text" width="20%" height={32} />
              </div>
            </div>
          </div>

          <div className="bg-[#faf9f5] rounded-[24px] border border-[#cccbc8]/60 p-8 space-y-6">
            <Skeleton variant="text" width="30%" height={24} />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton variant="rectangular" height={44} />
              <Skeleton variant="rectangular" height={44} />
            </div>
            <Skeleton variant="rectangular" height={120} />
          </div>
        </div>
      ) : error ? (
        <div className="bg-[#faf9f5] rounded-[24px] border border-[#d97757]/40 p-8 text-center max-w-xl mx-auto my-12">
          <AlertCircle className="h-10 w-10 text-[#d97757] mx-auto mb-3" />
          <h2 className="font-gothic text-xl font-bold uppercase tracking-tight text-[#141413]">
            Unable to Load Profile
          </h2>
          <p className="font-serif text-sm text-[#141413]/80 mt-2">{error}</p>
          <div className="mt-6">
            <Button variant="slate" size="sm" onClick={loadProfile}>
              Retry Loading
            </Button>
          </div>
        </div>
      ) : profile ? (
        <div>
          <nav
            className="flex items-center gap-6 sm:gap-10 border-b border-[#cccbc8] mb-8 overflow-x-auto no-scrollbar"
            aria-label="Settings sections"
          >
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  aria-selected={isActive}
                  role="tab"
                  className={`font-gothic text-[13px] font-semibold uppercase tracking-[0.10em] pb-3 whitespace-nowrap transition-colors relative cursor-pointer border-b-2 ${
                    isActive
                      ? "text-[#141413] border-[#141413]"
                      : "text-[#87867f] border-transparent hover:text-[#141413] hover:border-[#cccbc8]"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>

          <div role="tabpanel" className="space-y-8 animate-in fade-in duration-150">
            {activeTab === "details" && (
              <div className="space-y-8">
                <AvatarUploader
                  avatarUrl={profile.avatarUrl}
                  firstName={profile.firstName}
                  lastName={profile.lastName}
                  username={profile.username}
                  onAvatarUpdated={(newUrl) => {
                    setProfile((prev) => (prev ? { ...prev, avatarUrl: newUrl } : null));
                  }}
                  onNotify={triggerToast}
                />

                <BioEditor
                  initialFirstName={profile.firstName}
                  initialLastName={profile.lastName}
                  initialBio={profile.bio}
                  onProfileUpdated={(updated) => {
                    setProfile((prev) =>
                      prev
                        ? {
                            ...prev,
                            firstName: updated.firstName,
                            lastName: updated.lastName,
                            bio: updated.bio,
                          }
                        : null,
                    );
                  }}
                  onNotify={triggerToast}
                />
              </div>
            )}

            {activeTab === "links" && (
              <SocialLinksManager
                initialLinks={profile.socialLinks || []}
                onLinksChanged={(updatedLinks: SocialLinkDto[]) => {
                  setProfile((prev) => (prev ? { ...prev, socialLinks: updatedLinks } : null));
                }}
                onNotify={triggerToast}
              />
            )}

            {activeTab === "security" && <SecuritySettingsTab email={profile.email} />}
          </div>

          <div className="mt-14 pt-6 border-t border-[#cccbc8]/50 flex flex-col sm:flex-row items-center justify-between gap-4 font-serif text-xs text-[#87867f]">
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-[#87867f]" />
              <span>Signed in as Creator: @{profile.username}</span>
            </div>
            <span>Changes persist locally in browser storage</span>
          </div>
        </div>
      ) : null}
    </div>
  );
};
