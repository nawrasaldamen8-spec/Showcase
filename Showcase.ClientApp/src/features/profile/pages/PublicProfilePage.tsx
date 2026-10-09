import { ArrowLeft, SearchX } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient, queryKeys, tokenStorage } from "@shared/api/index.ts";
import { Button } from "@shared/components/Button.tsx";
import { useAuth } from "@shared/context/index.ts";
import type { PublicCareerData } from "@shared/types/index.ts";
import { useInfiniteProfilePostsQuery } from "../../posts/hooks/usePostQueries.ts";
import { usePublicProfileQuery } from "../hooks/useProfileQueries.ts";
import {
  type CareerSectionId,
  PostMasonryGrid,
  ProfileAboutTab,
  ProfileCareerTab,
  ProfileHeader,
  ProfileSkeleton,
} from "../components/index.ts";

const APP_NAME = "Pority";

type ProfileTab = "works" | "career" | "about";

export const PublicProfilePage: React.FC = () => {
  const { username = "" } = useParams<{ username: string }>();
  const { currentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const fromState = location.state as { from?: string; fromLabel?: string } | null;

  const rawTab = searchParams.get("tab");
  const activeTab: ProfileTab =
    rawTab === "career" || rawTab === "about" || rawTab === "works" ? rawTab : "works";

  const setActiveTab = (tab: ProfileTab) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (tab === "works") {
          next.delete("tab");
        } else {
          next.set("tab", tab);
        }
        return next;
      },
      { replace: true }
    );
  };

  const [selectedCareerSection, setSelectedCareerSection] = useState<CareerSectionId | null>(null);

  const {
    data: profile,
    isLoading: isProfileLoading,
    isError: isProfileError,
    error: profileError,
    refetch: refetchProfile,
  } = usePublicProfileQuery(username);

  const {
    data: postsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteProfilePostsQuery(username);

  const {
    data: careerData,
    refetch: refetchCareer,
  } = useQuery<PublicCareerData | null>({
    queryKey: queryKeys.career.public(username),
    queryFn: () => apiClient.getPublicCareer(username).catch(() => null),
    enabled: Boolean(username),
    staleTime: 1000 * 60 * 2,
  });

  const posts = postsData?.pages.flatMap((page) => page.items) ?? [];

  useEffect(() => {
    if (profile?.id) {
      const visitorToken = tokenStorage.getVisitorToken();
      apiClient.trackProfileVisit(profile.id, visitorToken).catch((err) => {
        console.warn("Failed to track profile visit:", err);
      });
    }
  }, [profile?.id]);

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: profile
            ? `${profile.name} (@${profile.username}) - ${APP_NAME}`
            : `${APP_NAME} Profile`,
          url,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      toast.success("Profile link copied to clipboard.");
    } else {
      toast.error("Unable to copy profile link.");
    }
  };

  if (isProfileLoading) {
    return <ProfileSkeleton />;
  }

  const is404 =
    !username ||
    (isProfileError && (profileError as { status?: number })?.status === 404);

  if (is404 || (!profile && !isProfileLoading)) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20 text-center">
        <div className="inline-flex items-center justify-center p-4 rounded-full bg-ivory-medium text-cloud-dark mb-6">
          <SearchX className="h-10 w-10 stroke-[1.5]" />
        </div>
        <span className="font-gothic text-xs font-bold uppercase tracking-[0.16em] text-cloud-dark block mb-2">
          Profile Not Found
        </span>
        <h1 className="font-gothic text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-slate-dark">
          Profile Unavailable
        </h1>
        <p className="font-serif text-[18px] text-slate-dark/80 mt-4 leading-relaxed max-w-lg mx-auto">
          No profile exists for &ldquo;@{username}&rdquo; on {APP_NAME}.
        </p>
        <div className="mt-8">
          <Link to={currentUser ? "/studio" : "/"}>
            <Button variant="slate" size="md" leftIcon={<ArrowLeft className="h-4 w-4" />}>
              {currentUser ? "Back to Studio" : "Back to Home"}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isProfileError || !profile) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-ivory-light border border-clay/40 rounded-card p-8">
          <p className="font-serif text-lg text-slate-dark">
            Unable to load profile. Please try again.
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <Link to={currentUser ? "/studio" : "/"}>
              <Button variant="outline" size="sm">
                {currentUser ? "Back to Studio" : "Back to Home"}
              </Button>
            </Link>
            <Button
              variant="slate"
              size="sm"
              onClick={() => {
                void refetchProfile();
                void refetchCareer();
              }}
            >
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser?.username?.toLowerCase() === profile.username.toLowerCase();

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    if (fromState?.from) {
      navigate(fromState.from);
    } else {
      navigate(isOwnProfile ? "/studio" : "/feed");
    }
  };

  const backLabel = fromState?.fromLabel || (isOwnProfile ? "Studio" : "Feed");

  // Exactly 3 top-level navigation tabs: Works, Career, About
  const tabList: Array<{ id: ProfileTab; label: string }> = [
    { id: "works", label: "Works" },
    { id: "career", label: "Career" },
    { id: "about", label: "About" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10">
      {fromState?.from && (
        <nav className="mb-6" aria-label="Breadcrumb navigation">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 font-gothic text-xs font-semibold uppercase tracking-[0.12em] text-cloud-dark hover:text-slate-dark transition-colors group cursor-pointer bg-transparent border-none p-0"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
            <span>{backLabel}</span>
          </button>
        </nav>
      )}

      <ProfileHeader profile={profile} isOwnProfile={isOwnProfile} onShare={handleShare} />

      {/* Top-Level Navigation Tabs (Works, Career, About) */}
      <nav
        className="flex items-center gap-6 sm:gap-8 border-b border-stone mb-8 overflow-x-auto no-scrollbar"
        aria-label="Profile tabs"
      >
        {tabList.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id === "career") {
                  setSelectedCareerSection(null);
                }
              }}
              aria-selected={isActive}
              role="tab"
              className={`font-gothic text-[13px] font-semibold uppercase tracking-[0.10em] pb-3 whitespace-nowrap transition-colors relative cursor-pointer border-b -mb-[1px] flex items-center gap-2 ${
                isActive
                  ? "text-slate-dark border-slate-dark"
                  : "text-cloud-dark border-transparent hover:text-slate-dark hover:border-stone"
              }`}
            >
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Tab Panels */}
      {activeTab === "works" && (
        <section aria-label="Published Works">
          <PostMasonryGrid
            posts={posts}
            creator={profile}
            isOwnProfile={isOwnProfile}
            hasNextPage={Boolean(hasNextPage)}
            isLoadingMore={isFetchingNextPage}
            onLoadMore={handleLoadMore}
          />
        </section>
      )}

      {activeTab === "career" && (
        <ProfileCareerTab
          careerData={careerData ?? null}
          selectedSection={selectedCareerSection}
          onSelectSection={setSelectedCareerSection}
        />
      )}

      {activeTab === "about" && (
        <ProfileAboutTab
          bio={profile.bio}
          socialLinks={profile.socialLinks}
          country={profile.country}
          isOwnProfile={isOwnProfile}
          creatorName={profile.name}
          username={profile.username}
        />
      )}
    </div>
  );
};
