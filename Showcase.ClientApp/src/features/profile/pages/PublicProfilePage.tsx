import { ArrowLeft, SearchX } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { apiClient } from "@shared/api/apiClient.ts";
import { Button } from "@shared/components/Button.tsx";
import { useAuth, useToast } from "@shared/context/index.ts";
import type {
  PostSummaryResponse,
  PublicCareerData,
  PublicProfileResponse,
} from "@shared/types/index.ts";
import {
  type CareerSectionId,
  PostMasonryGrid,
  ProfileAboutTab,
  ProfileCareerTab,
  ProfileHeader,
  ProfileSkeleton,
} from "../components/index.ts";

const PAGE_SIZE = 12;
const APP_NAME = "Pority";

type ProfileTab = "works" | "career" | "about";

export const PublicProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const fromState = location.state as { from?: string; fromLabel?: string } | null;

  const [profile, setProfile] = useState<PublicProfileResponse | null>(null);
  const [posts, setPosts] = useState<PostSummaryResponse[]>([]);
  const [careerData, setCareerData] = useState<PublicCareerData | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [notFound, setNotFound] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ProfileTab>("works");
  const [selectedCareerSection, setSelectedCareerSection] = useState<CareerSectionId | null>(null);

  const loadProfileData = useCallback(async () => {
    if (!username) {
      setNotFound(true);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setNotFound(false);

    try {
      const [profileData, postsData, careerRes] = await Promise.all([
        apiClient.getPublicProfile(username),
        apiClient.getCreatorPosts(username, 1, PAGE_SIZE),
        apiClient.getPublicCareer(username).catch((err) => {
          console.warn("Failed to load public career data:", err);
          return null;
        }),
      ]);

      setProfile(profileData);
      setPosts(postsData.items);
      setPageNumber(1);
      setHasNextPage(postsData.hasNextPage);
      setCareerData(careerRes);
    } catch (err: unknown) {
      console.error("Failed to load creator profile:", err);
      const status = (err as { status?: number })?.status;
      if (status === 404) {
        setNotFound(true);
      } else {
        setError("Unable to load profile. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [username]);

  useEffect(() => {
    let isCancelled = false;
    void Promise.resolve().then(async () => {
      if (isCancelled) return;
      await loadProfileData();
    });
    return () => {
      isCancelled = true;
    };
  }, [loadProfileData]);

  const handleLoadMore = async () => {
    if (!username || isLoadingMore || !hasNextPage) return;

    setIsLoadingMore(true);
    const nextPage = pageNumber + 1;
    try {
      const postsData = await apiClient.getCreatorPosts(username, nextPage, PAGE_SIZE);
      setPosts((prev) => [...prev, ...postsData.items]);
      setPageNumber(nextPage);
      setHasNextPage(postsData.hasNextPage);
    } catch (err) {
      console.error("Failed to load more works for profile:", err);
    } finally {
      setIsLoadingMore(false);
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
      showToast("success", "Profile link copied to clipboard.");
    } else {
      showToast("error", "Unable to copy profile link.");
    }
  };

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (notFound || !profile) {
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
          <Link to="/studio">
            <Button variant="slate" size="md" leftIcon={<ArrowLeft className="h-4 w-4" />}>
              Back to Studio
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-ivory-light border border-clay/40 rounded-card p-8">
          <p className="font-serif text-lg text-slate-dark">{error}</p>
          <div className="mt-6 flex justify-center gap-4">
            <Link to="/studio">
              <Button variant="outline" size="sm">
                Back to Studio
              </Button>
            </Link>
            <Button variant="slate" size="sm" onClick={loadProfileData}>
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
    } else if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate(isOwnProfile ? "/studio" : "/feed");
    }
  };

  const backLabel = fromState?.fromLabel || (isOwnProfile ? "Studio" : "Feed");

  const totalCareerCount =
    (careerData?.visibility?.experience ? (careerData?.experiences?.length ?? 0) : 0) +
    (careerData?.visibility?.academics ? (careerData?.academics?.length ?? 0) : 0) +
    (careerData?.visibility?.skills ? (careerData?.skills?.length ?? 0) : 0) +
    (careerData?.visibility?.credentials ? (careerData?.credentials?.length ?? 0) : 0) +
    (careerData?.visibility?.languages ? (careerData?.languages?.length ?? 0) : 0) +
    (careerData?.visibility?.achievements ? (careerData?.achievements?.length ?? 0) : 0);

  // Exactly 3 top-level navigation tabs: Works, Career, About
  const tabList: Array<{ id: ProfileTab; label: string; count?: number }> = [
    { id: "works", label: "Works", count: posts.length },
    { id: "career", label: "Career", count: totalCareerCount > 0 ? totalCareerCount : undefined },
    { id: "about", label: "About" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10">
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
              className={`font-gothic text-[13px] font-semibold uppercase tracking-[0.10em] pb-3 whitespace-nowrap transition-colors relative cursor-pointer border-b-2 flex items-center gap-2 ${
                isActive
                  ? "text-slate-dark border-slate-dark"
                  : "text-cloud-dark border-transparent hover:text-slate-dark hover:border-stone"
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive
                      ? "bg-slate-dark text-ivory-light"
                      : "bg-ivory-medium text-cloud-dark"
                  }`}
                >
                  {tab.count}
                </span>
              )}
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
            hasNextPage={hasNextPage}
            isLoadingMore={isLoadingMore}
            onLoadMore={handleLoadMore}
          />
        </section>
      )}

      {activeTab === "career" && (
        <ProfileCareerTab
          careerData={careerData}
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
