import { ArrowLeft, SearchX } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiClient } from "@shared/api/apiClient.ts";
import { Button } from "@shared/components/Button.tsx";
import { useAuth, useToast } from "@shared/context/index.ts";
import type { PostSummaryResponse, PublicProfileResponse } from "@shared/types/index.ts";
import { PostMasonryGrid } from "../components/PostMasonryGrid.tsx";
import { ProfileAboutTab } from "../components/ProfileAboutTab.tsx";
import { ProfileHeader } from "../components/ProfileHeader.tsx";
import { ProfileSkeleton } from "../components/ProfileSkeleton.tsx";

const PAGE_SIZE = 12;
type ProfileTab = "works" | "about";

export const PublicProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [profile, setProfile] = useState<PublicProfileResponse | null>(null);
  const [posts, setPosts] = useState<PostSummaryResponse[]>([]);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [notFound, setNotFound] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ProfileTab>("works");

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
      const profileData = await apiClient.getPublicProfile(username);
      setProfile(profileData);

      const postsData = await apiClient.getCreatorPosts(username, 1, PAGE_SIZE);
      setPosts(postsData.items);
      setPageNumber(1);
      setHasNextPage(postsData.hasNextPage);
    } catch (err: unknown) {
      console.error("Failed to load creator profile:", err);
      const status = (err as { status?: number })?.status;
      if (status === 404) {
        setNotFound(true);
      } else {
        setError("Unable to load artist profile. Please try again.");
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
            ? `${profile.firstName} ${profile.lastName} (@${profile.username}) - Showcase`
            : "Showcase Profile",
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
        <div className="inline-flex items-center justify-center p-4 rounded-full bg-[#f0eee6] text-[#87867f] mb-6">
          <SearchX className="h-10 w-10 stroke-[1.5]" />
        </div>
        <span className="font-gothic text-xs font-bold uppercase tracking-[0.16em] text-[#87867f] block mb-2">
          Artist Not Found
        </span>
        <h1 className="font-gothic text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-[#141413]">
          Creator Profile Unavailable
        </h1>
        <p className="font-serif text-[18px] text-[#141413]/80 mt-4 leading-relaxed max-w-lg mx-auto">
          No artist or designer profile exists for username &ldquo;@{username}&rdquo; in the Showcase exhibition
          registry.
        </p>
        <div className="mt-8">
          <Link to="/studio">
            <Button variant="slate" size="md" leftIcon={<ArrowLeft className="h-4 w-4" />}>
              Return to Studio
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-[#faf9f5] border border-[#d97757]/40 rounded-[24px] p-8">
          <p className="font-serif text-lg text-[#141413]">{error}</p>
          <div className="mt-6 flex justify-center gap-4">
            <Link to="/studio">
              <Button variant="outline" size="sm">
                Return to Studio
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

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10">
      <nav className="mb-6" aria-label="Breadcrumb navigation">
        <Link
          to="/studio"
          className="inline-flex items-center gap-2 font-gothic text-xs font-semibold uppercase tracking-[0.12em] text-[#87867f] hover:text-[#141413] transition-colors group"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
          <span>Creator Studio</span>
        </Link>
      </nav>

      <ProfileHeader profile={profile} isOwnProfile={isOwnProfile} onShare={handleShare} />

      <nav
        className="flex items-center gap-6 sm:gap-8 border-b border-[#cccbc8] mb-8 overflow-x-auto no-scrollbar"
        aria-label="Profile tabs"
      >
        <button
          type="button"
          onClick={() => setActiveTab("works")}
          aria-selected={activeTab === "works"}
          role="tab"
          className={`font-gothic text-[13px] font-semibold uppercase tracking-[0.10em] pb-3 whitespace-nowrap transition-colors relative cursor-pointer border-b-2 ${
            activeTab === "works"
              ? "text-[#141413] border-[#141413]"
              : "text-[#87867f] border-transparent hover:text-[#141413] hover:border-[#cccbc8]"
          }`}
        >
          Works
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("about")}
          aria-selected={activeTab === "about"}
          role="tab"
          className={`font-gothic text-[13px] font-semibold uppercase tracking-[0.10em] pb-3 whitespace-nowrap transition-colors relative cursor-pointer border-b-2 ${
            activeTab === "about"
              ? "text-[#141413] border-[#141413]"
              : "text-[#87867f] border-transparent hover:text-[#141413] hover:border-[#cccbc8]"
          }`}
        >
          About
        </button>
      </nav>

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

      {activeTab === "about" && (
        <ProfileAboutTab bio={profile.bio} socialLinks={profile.socialLinks} />
      )}
    </div>
  );
};
