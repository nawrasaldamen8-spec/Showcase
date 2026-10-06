import { AlertCircle, ArrowLeft, UserCheck } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";
import { extractApiErrorMessage } from "@shared/api/index.ts";
import { Button } from "@shared/components/Button.tsx";
import { Skeleton } from "@shared/components/Skeleton.tsx";
import { useAuth } from "@shared/context/index.ts";
import { SocialLinksManager } from "../components/SocialLinksManager.tsx";
import { useMyProfileQuery } from "../hooks/useProfileQueries.ts";

export const EditSocialLinksPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { data: profile, isLoading, isError, error, refetch } = useMyProfileQuery();

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
            Links
          </span>
        </div>

        <h1 className="font-gothic font-extrabold text-3xl sm:text-4xl uppercase tracking-tight text-slate-dark">
          Manage Social Links
        </h1>

        <p className="font-serif text-sm sm:text-base text-slate-dark/75 leading-relaxed">
          Add links to your external websites, repositories, portfolios, and social profiles.
        </p>
      </header>

      {/* Main Content */}
      {isLoading ? (
        <div className="space-y-6" aria-busy="true">
          <div className="bg-ivory-light rounded-card border border-stone/60 p-8 space-y-4">
            <Skeleton variant="text" width="30%" height={24} />
            <Skeleton variant="rectangular" height={50} />
            <Skeleton variant="rectangular" height={50} />
          </div>
        </div>
      ) : isError ? (
        <div className="bg-ivory-light rounded-card border border-clay/40 p-8 text-center max-w-xl mx-auto my-12">
          <AlertCircle className="h-10 w-10 text-clay mx-auto mb-3" />
          <h2 className="font-gothic text-xl font-bold uppercase tracking-tight text-slate-dark">
            Unable to Load Social Links
          </h2>
          <p className="font-serif text-sm text-slate-dark/80 mt-2">
            {extractApiErrorMessage(error, "Unable to load social links. Please try again.")}
          </p>
          <div className="mt-6">
            <Button variant="slate" size="sm" onClick={() => void refetch()}>
              Retry Loading
            </Button>
          </div>
        </div>
      ) : profile ? (
        <div className="space-y-8">
          <SocialLinksManager links={profile.socialLinks || []} />

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
