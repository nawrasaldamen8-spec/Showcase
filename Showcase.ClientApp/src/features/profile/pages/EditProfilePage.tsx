import { AlertCircle, ArrowLeft, UserCheck } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { apiClient } from "@shared/api/apiClient.ts";
import { Button } from "@shared/components/Button.tsx";
import { Skeleton } from "@shared/components/Skeleton.tsx";
import { useAuth } from "@shared/context/index.ts";
import type { MyProfileResponse } from "@shared/types/index.ts";
import { AvatarUploader } from "../components/AvatarUploader.tsx";
import { BioEditor } from "../components/BioEditor.tsx";

export const EditProfilePage: React.FC = () => {
  const { currentUser } = useAuth();

  const [profile, setProfile] = useState<MyProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;
    async function fetchProfile() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await apiClient.getMyProfile();
        if (isMounted) setProfile(data);
      } catch (err: unknown) {
        console.error("Failed to load profile:", err);
        if (isMounted) setError("Unable to load profile. Please try again.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    void fetchProfile();
    return () => {
      isMounted = false;
    };
  }, [retryCount]);

  const handleNotify = (message: string, type?: "success" | "error") => {
    if (type === "error") {
      toast.error(message);
    } else {
      toast.success(message);
    }
  };

  const username = profile?.username || currentUser?.username;
  const backUrl = username ? `/u/${username}` : "/studio";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 min-h-[80vh]">
      {/* Navigation Breadcrumb */}
      <nav className="mb-6" aria-label="Breadcrumb navigation">
        <Link
          to={backUrl}
          className="inline-flex items-center gap-2 font-gothic text-xs font-semibold uppercase tracking-[0.14em] text-cloud-dark hover:text-slate-dark transition-colors group text-decoration-none"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Profile</span>
        </Link>
      </nav>

      {/* Page Header */}
      <header className="border-b border-stone pb-6 mb-8 space-y-2">
        <div className="flex items-center gap-2">
          <span className="font-gothic text-xs font-bold uppercase tracking-[0.16em] text-clay">
            Account Settings
          </span>
          <span className="text-stone">&bull;</span>
          <span className="font-gothic text-xs font-semibold uppercase tracking-[0.10em] text-cloud-dark">
            Profile
          </span>
        </div>

        <h1 className="font-gothic font-extrabold text-3xl sm:text-4xl uppercase tracking-tight text-slate-dark">
          Edit Profile
        </h1>

        <p className="font-serif text-sm sm:text-base text-slate-dark/75 leading-relaxed">
          Update your portrait, identity, specialty, and biography across Pority.
        </p>
      </header>

      {/* Main Content */}
      {isLoading ? (
        <div className="space-y-8" aria-busy="true">
          <div className="bg-ivory-light rounded-card border border-stone/60 p-8">
            <div className="flex items-center gap-6">
              <Skeleton variant="circular" width={112} height={112} />
              <div className="flex-1 space-y-3">
                <Skeleton variant="text" width="40%" height={24} />
                <Skeleton variant="text" width="70%" height={16} />
                <Skeleton variant="text" width="20%" height={32} />
              </div>
            </div>
          </div>

          <div className="bg-ivory-light rounded-card border border-stone/60 p-8 space-y-6">
            <Skeleton variant="text" width="30%" height={24} />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton variant="rectangular" height={44} />
              <Skeleton variant="rectangular" height={44} />
            </div>
            <Skeleton variant="rectangular" height={120} />
          </div>
        </div>
      ) : error ? (
        <div className="bg-ivory-light rounded-card border border-clay/40 p-8 text-center max-w-xl mx-auto my-12">
          <AlertCircle className="h-10 w-10 text-clay mx-auto mb-3" />
          <h2 className="font-gothic text-xl font-bold uppercase tracking-tight text-slate-dark">
            Unable to Load Profile
          </h2>
          <p className="font-serif text-sm text-slate-dark/80 mt-2">{error}</p>
          <div className="mt-6">
            <Button variant="slate" size="sm" onClick={() => setRetryCount((c) => c + 1)}>
              Retry Loading
            </Button>
          </div>
        </div>
      ) : profile ? (
        <div className="space-y-8">
          <AvatarUploader
            avatarUrl={profile.avatarUrl}
            name={profile.name}
            username={profile.username}
            onAvatarUpdated={(newUrl) => {
              setProfile((prev) => (prev ? { ...prev, avatarUrl: newUrl } : null));
            }}
            onNotify={handleNotify}
          />

          <BioEditor
            initialName={profile.name}
            initialSpecialty={profile.specialty}
            initialCountry={profile.country}
            initialBio={profile.bio}
            onProfileUpdated={(updated) => {
              setProfile((prev) =>
                prev
                  ? {
                      ...prev,
                      name: updated.name,
                      specialty: updated.specialty,
                      country: updated.country,
                      bio: updated.bio,
                    }
                  : null,
              );
            }}
            onNotify={handleNotify}
          />

          <div className="pt-6 border-t border-stone/50 flex items-center justify-between font-serif text-xs text-cloud-dark">
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-cloud-dark" />
              <span>Signed in as: @{profile.username}</span>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
