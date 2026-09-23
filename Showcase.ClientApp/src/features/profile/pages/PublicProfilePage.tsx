import {
  ArrowDown,
  ArrowLeft,
  ArrowUpRight,
  Check,
  Edit3,
  Layers,
  SearchX,
  Share2,
  User as UserIcon,
  UserPlus,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiClient } from "../../../shared/api/apiClient.ts";
import { Button } from "../../../shared/components/Button.tsx";
import { Skeleton } from "../../../shared/components/Skeleton.tsx";
import { useAuth, useToast } from "../../../shared/context/index.ts";
import type { ExplorePostResponse, PostSummaryResponse, PublicProfileResponse } from "../../../shared/types/index.ts";
import { PostCard } from "../../explore/components/PostCard.tsx";
import { PlatformIcon } from "../components/PlatformIcon.tsx";

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

  // Tabs state: 'works' is active and default
  const [activeTab, setActiveTab] = useState<ProfileTab>("works");

  // Local follow state for visitor interaction
  const [isFollowing, setIsFollowing] = useState<boolean>(false);

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
      // 1. Fetch public profile details
      const profileData = await apiClient.getPublicProfile(username);
      setProfile(profileData);

      // 2. Fetch creator's published works
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

  const handleToggleFollow = () => {
    setIsFollowing((prev) => {
      const next = !prev;
      showToast(
        "success",
        next
          ? `You are now following @${profile?.username || username}`
          : `Unfollowed @${profile?.username || username}`,
      );
      return next;
    });
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
        // Fallback to clipboard if share modal was dismissed or unsupported
      }
    }
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      showToast("success", "Profile link copied to clipboard.");
    } else {
      showToast("error", "Unable to copy profile link.");
    }
  };

  // Loading Skeleton State
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 animate-pulse">
        {/* Back Link Skeleton */}
        <Skeleton variant="text" width={140} height={18} className="mb-6" />

        {/* Compact Header Skeleton */}
        <div className="bg-[#faf9f5] rounded-[24px] border border-[#cccbc8]/50 p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4 sm:gap-6">
              <Skeleton variant="circular" width={72} height={72} />
              <div className="space-y-2">
                <Skeleton variant="text" width={90} height={14} />
                <Skeleton variant="text" width={160} height={28} />
              </div>
            </div>
            <div className="flex gap-2.5">
              <Skeleton variant="rectangular" width={90} height={36} className="rounded-full" />
              <Skeleton variant="rectangular" width={80} height={36} className="rounded-full" />
            </div>
          </div>
        </div>

        {/* Tabs Skeleton */}
        <div className="flex gap-6 border-b border-[#cccbc8] pb-3 mb-8">
          <Skeleton variant="text" width={60} height={18} />
          <Skeleton variant="text" width={60} height={18} />
        </div>

        {/* Masonry Columns Skeleton */}
        <div className="columns-2 sm:columns-3 lg:columns-4 gap-3.5 sm:gap-4 lg:gap-5 [column-fill:_balance]">
          {[
            "aspect-[3/4]",
            "aspect-square",
            "aspect-[4/3]",
            "aspect-[3/4]",
            "aspect-square",
            "aspect-[4/5]",
            "aspect-[4/3]",
            "aspect-[3/4]",
          ].map((aspect, idx) => (
            <div key={idx} className="break-inside-avoid mb-3.5 sm:mb-4 lg:mb-5">
              <div className={`${aspect} bg-[#e6e3da] w-full overflow-hidden`}>
                <Skeleton variant="rectangular" className="w-full h-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 404 Creator Not Found State
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
          <Link to="/explore">
            <Button variant="slate" size="md" leftIcon={<ArrowLeft className="h-4 w-4" />}>
              Return to Curated Feed
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // General Error State
  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-[#faf9f5] border border-[#d97757]/40 rounded-[24px] p-8">
          <p className="font-serif text-lg text-[#141413]">{error}</p>
          <div className="mt-6 flex justify-center gap-4">
            <Link to="/explore">
              <Button variant="outline" size="sm">
                Explore Feed
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

  const fullName = `${profile.firstName} ${profile.lastName}`.trim();
  const sortedSocialLinks = [...(profile.socialLinks || [])].sort((a, b) => a.displayOrder - b.displayOrder);
  const isOwnProfile = currentUser?.username?.toLowerCase() === profile.username.toLowerCase();

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* Editorial Breadcrumb / Back Link */}
      <nav className="mb-6" aria-label="Breadcrumb navigation">
        <Link
          to="/explore"
          className="inline-flex items-center gap-2 font-gothic text-xs font-semibold uppercase tracking-[0.12em] text-[#87867f] hover:text-[#141413] transition-colors group"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
          <span>Curated Visual Showcase</span>
        </Link>
      </nav>

      {/* 1. Compact Minimalist Profile Header */}
      <header className="bg-[#faf9f5] rounded-[24px] border border-[#cccbc8]/60 p-6 sm:p-8 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 sm:gap-6">
          {/* Creator Identity */}
          <div className="flex items-center gap-4 sm:gap-6">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={fullName}
                className="h-16 w-16 sm:h-20 sm:w-20 rounded-full object-cover border-2 border-[#cccbc8]/70 shrink-0"
              />
            ) : (
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-[#141413] text-[#faf9f5] flex items-center justify-center font-gothic text-xl sm:text-2xl font-extrabold uppercase shrink-0">
                {profile.firstName?.[0] || <UserIcon className="h-8 w-8" />}
              </div>
            )}

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-gothic text-xs font-semibold uppercase tracking-[0.10em] text-[#87867f]">
                  @{profile.username}
                </span>
              </div>
              <h1 className="font-gothic font-extrabold text-2xl sm:text-3xl text-[#141413] tracking-[-0.02em]">
                {fullName}
              </h1>
            </div>
          </div>

          {/* Action Buttons: Follow / Edit Profile + Share */}
          <div className="flex items-center gap-2.5 sm:gap-3 self-start sm:self-center">
            {isOwnProfile ? (
              <Link to="/settings/profile" className="text-decoration-none">
                <Button variant="outline" size="sm" leftIcon={<Edit3 className="h-3.5 w-3.5" />}>
                  Edit Profile
                </Button>
              </Link>
            ) : (
              <Button
                variant={isFollowing ? "outline" : "slate"}
                size="sm"
                onClick={handleToggleFollow}
                leftIcon={isFollowing ? <Check className="h-3.5 w-3.5" /> : <UserPlus className="h-3.5 w-3.5" />}
              >
                {isFollowing ? "Following" : "Follow"}
              </Button>
            )}

            <Button variant="outline" size="sm" onClick={handleShare} leftIcon={<Share2 className="h-3.5 w-3.5" />}>
              Share
            </Button>
          </div>
        </div>
      </header>

      {/* 2. Typographic Tabs Navigation (Works & About) */}
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

      {/* 3. Works Tab: Dynamic Asymmetric Bento Grid */}
      {activeTab === "works" && (
        <section aria-label="Published Works">
          {posts.length === 0 ? (
            /* Empty State */
            <div className="bg-[#faf9f5] rounded-[24px] border border-[#cccbc8]/50 p-12 sm:p-16 text-center max-w-lg mx-auto my-8">
              <div className="inline-flex items-center justify-center p-3 rounded-full bg-[#f0eee6] text-[#87867f] mb-4">
                <Layers className="h-7 w-7 stroke-[1.5]" />
              </div>
              <h3 className="font-gothic text-xl font-bold uppercase tracking-tight text-[#141413]">
                No Published Works Yet
              </h3>
              <p className="font-serif text-[16px] text-[#141413]/75 mt-2 leading-relaxed">
                This creator hasn&rsquo;t published any exhibition plates yet. Check back soon for upcoming collections.
              </p>
              <div className="mt-6">
                <Link to="/explore">
                  <Button variant="slate" size="sm">
                    Explore Other Artists
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Natural Masonry Exhibition Layout - Varied Dimensions Flowing Across 4 Columns */}
              <div className="columns-2 sm:columns-3 lg:columns-4 gap-3.5 sm:gap-4 lg:gap-5 [column-fill:_balance]">
                {posts.map((post) => (
                  <div key={post.id} className="break-inside-avoid mb-3.5 sm:mb-4 lg:mb-5">
                    <PostCard
                      post={
                        {
                          ...post,
                          creator: {
                            profileId: profile.id,
                            username: profile.username,
                            firstName: profile.firstName,
                            lastName: profile.lastName,
                            avatarUrl: profile.avatarUrl,
                          },
                        } as ExplorePostResponse
                      }
                      aspectRatio="auto"
                    />
                  </div>
                ))}
              </div>

              {/* Pagination / Load More */}
              {hasNextPage && (
                <div className="mt-10 sm:mt-12 text-center">
                  <Button
                    variant="slate"
                    size="md"
                    onClick={handleLoadMore}
                    isLoading={isLoadingMore}
                    rightIcon={!isLoadingMore ? <ArrowDown className="h-4 w-4" /> : undefined}
                    className="px-8"
                  >
                    Load More Works
                  </Button>
                </div>
              )}
            </>
          )}
        </section>
      )}

      {/* 4. About Tab: Bio & Social Archives */}
      {activeTab === "about" && (
        <section aria-label="About Creator" className="space-y-6 max-w-3xl">
          {/* Biography Card */}
          <div className="bg-[#faf9f5] rounded-[24px] border border-[#cccbc8]/60 p-6 sm:p-8">
            <h2 className="font-gothic text-xs font-bold uppercase tracking-[0.16em] text-[#87867f] mb-3">Biography</h2>
            {profile.bio ? (
              <p className="font-serif text-[17px] sm:text-[19px] leading-relaxed text-[#141413]/85 whitespace-pre-line">
                {profile.bio}
              </p>
            ) : (
              <p className="font-serif text-[16px] italic text-[#87867f]">No biography provided yet.</p>
            )}
          </div>

          {/* Social Links Card with Platform Icons */}
          {sortedSocialLinks.length > 0 && (
            <div className="bg-[#faf9f5] rounded-[24px] border border-[#cccbc8]/60 p-6 sm:p-8">
              <h2 className="font-gothic text-xs font-bold uppercase tracking-[0.16em] text-[#87867f] mb-4">
                Connect &amp; External Archives
              </h2>
              <div className="flex flex-wrap gap-3">
                {sortedSocialLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full border border-[#cccbc8] hover:border-[#141413] bg-[#faf9f5] hover:bg-[#141413] text-[#141413] hover:text-[#faf9f5] transition-all font-gothic text-xs font-semibold uppercase tracking-[0.10em] group shadow-none"
                  >
                    <PlatformIcon platform={link.platform} className="h-4 w-4 shrink-0 transition-colors" />
                    <span>{link.platform}</span>
                    <ArrowUpRight className="h-3 w-3 opacity-60 group-hover:opacity-100 transition-opacity" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
};
