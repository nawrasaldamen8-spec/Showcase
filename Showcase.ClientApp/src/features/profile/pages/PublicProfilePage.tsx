import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowUpRight,
  Globe,
  User as UserIcon,
  SearchX,
  Layers,
  ArrowDown,
} from 'lucide-react';
import type {
  PublicProfileResponse,
  PostSummaryResponse,
  ExplorePostResponse,
} from '../../../shared/types/index.ts';
import { apiClient } from '../../../shared/api/apiClient.ts';
import { Button } from '../../../shared/components/Button.tsx';
import { Skeleton } from '../../../shared/components/Skeleton.tsx';
import { PostCard } from '../../explore/components/PostCard.tsx';

const PAGE_SIZE = 6;

export const PublicProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();

  const [profile, setProfile] = useState<PublicProfileResponse | null>(null);
  const [posts, setPosts] = useState<PostSummaryResponse[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [notFound, setNotFound] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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
      setTotalCount(postsData.totalCount);
      setPageNumber(1);
      setHasNextPage(postsData.hasNextPage);
    } catch (err: unknown) {
      console.error('Failed to load creator profile:', err);
      const status = (err as { status?: number })?.status;
      if (status === 404) {
        setNotFound(true);
      } else {
        setError('Unable to load artist profile. Please try again.');
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
      console.error('Failed to load more works for profile:', err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Loading Skeleton State
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-pulse">
        {/* Back Link Skeleton */}
        <Skeleton variant="text" width={140} height={18} className="mb-8" />

        {/* Profile Header Skeleton */}
        <div className="bg-[#faf9f5] rounded-[24px] border border-[#cccbc8]/50 p-8 sm:p-12 mb-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-8">
            <Skeleton variant="circular" width={112} height={112} />
            <div className="space-y-3 flex-1">
              <Skeleton variant="text" width={120} height={14} />
              <Skeleton variant="text" width="60%" height={36} />
              <Skeleton variant="text" width="85%" height={20} />
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-[#cccbc8]/40 flex gap-3">
            <Skeleton variant="text" width={100} height={32} />
            <Skeleton variant="text" width={100} height={32} />
          </div>
        </div>

        {/* Portfolio Grid Skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={idx}
              className="bg-[#faf9f5] rounded-[24px] border border-[#cccbc8]/50 overflow-hidden"
            >
              <Skeleton variant="rectangular" className="aspect-[4/3] w-full" />
              <div className="p-6 space-y-3">
                <Skeleton variant="text" width="70%" height={24} />
                <Skeleton variant="text" width="90%" height={16} />
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
          No artist or designer profile exists for username &ldquo;@{username}&rdquo; in the Showcase exhibition registry.
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
  const sortedSocialLinks = [...(profile.socialLinks || [])].sort(
    (a, b) => a.displayOrder - b.displayOrder
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Editorial Breadcrumb / Back Link */}
      <nav className="mb-8" aria-label="Breadcrumb navigation">
        <Link
          to="/explore"
          className="inline-flex items-center gap-2 font-gothic text-xs font-semibold uppercase tracking-[0.12em] text-[#87867f] hover:text-[#141413] transition-colors group"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
          <span>Curated Visual Showcase</span>
        </Link>
      </nav>

      {/* Creator Profile Header Card */}
      <header className="bg-[#faf9f5] rounded-[24px] border border-[#cccbc8]/60 p-8 sm:p-12 mb-14">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 sm:gap-10">
          {/* Large Circular Avatar */}
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={fullName}
              className="h-24 w-24 sm:h-32 sm:w-32 rounded-full object-cover border-2 border-[#cccbc8]/70 shrink-0"
            />
          ) : (
            <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-full bg-[#141413] text-[#faf9f5] flex items-center justify-center font-gothic text-3xl sm:text-4xl font-extrabold uppercase shrink-0">
              {profile.firstName?.[0] || <UserIcon className="h-12 w-12" />}
            </div>
          )}

          {/* Artist Typography & Bio */}
          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-gothic text-xs font-bold uppercase tracking-[0.16em] text-[#87867f]">
                Contributing Artist
              </span>
              <span className="text-[#cccbc8]">&bull;</span>
              <span className="font-gothic text-xs font-semibold uppercase tracking-[0.10em] text-[#141413] bg-[#cccbc8]/30 px-2.5 py-0.5 rounded-full">
                @{profile.username}
              </span>
            </div>

            <h1 className="font-gothic font-extrabold text-3xl sm:text-5xl text-[#141413] tracking-[-0.03em] leading-tight">
              {fullName}
            </h1>

            {/* Bio in Anthropic Serif */}
            {profile.bio ? (
              <p className="font-serif text-[17px] sm:text-[19px] leading-relaxed text-[#141413]/85 max-w-3xl pt-1">
                {profile.bio}
              </p>
            ) : (
              <p className="font-serif text-[16px] italic text-[#87867f] pt-1">
                Visual artist and designer contributing independent works to the Showcase exhibition.
              </p>
            )}
          </div>
        </div>

        {/* Ordered Social Links with External Arrow Indicators */}
        {sortedSocialLinks.length > 0 && (
          <div className="mt-8 pt-6 border-t border-[#cccbc8]/40">
            <span className="font-gothic text-[11px] font-bold uppercase tracking-[0.14em] text-[#87867f] block mb-3">
              Connect &amp; External Archives
            </span>
            <div className="flex flex-wrap gap-3">
              {sortedSocialLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#cccbc8] hover:border-[#141413] bg-transparent text-[#141413] hover:bg-[#141413]/5 transition-colors font-gothic text-xs font-semibold uppercase tracking-[0.10em] group"
                >
                  <Globe className="h-3.5 w-3.5 text-[#87867f] group-hover:text-[#141413] transition-colors" />
                  <span>{link.platform}</span>
                  <ArrowUpRight className="h-3 w-3 text-[#87867f] group-hover:text-[#141413] transition-colors" />
                </a>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Published Works Portfolio Section */}
      <section aria-labelledby="portfolio-heading">
        <div className="flex items-baseline justify-between border-b border-[#cccbc8]/60 pb-4 mb-8">
          <div>
            <h2
              id="portfolio-heading"
              className="font-gothic text-2xl sm:text-3xl font-bold uppercase tracking-tight text-[#141413]"
            >
              Published Works
            </h2>
            <p className="font-serif text-sm sm:text-base text-[#87867f] mt-1">
              Curated photographic series, prototypes, and visual plates by {fullName}.
            </p>
          </div>
          <div className="font-gothic text-xs uppercase tracking-wider text-[#87867f] hidden sm:block">
            {totalCount} {totalCount === 1 ? 'Plate' : 'Plates'}
          </div>
        </div>

        {/* Empty State when creator has no published works */}
        {posts.length === 0 ? (
          <div className="bg-[#faf9f5] rounded-[24px] border border-[#cccbc8]/50 p-12 sm:p-16 text-center max-w-lg mx-auto my-8">
            <div className="inline-flex items-center justify-center p-3 rounded-full bg-[#f0eee6] text-[#87867f] mb-4">
              <Layers className="h-7 w-7 stroke-[1.5]" />
            </div>
            <h3 className="font-gothic text-xl font-bold uppercase tracking-tight text-[#141413]">
              No Published Works Yet
            </h3>
            <p className="font-serif text-[16px] text-[#141413]/75 mt-2 leading-relaxed">
              This creator hasn&rsquo;t published any public exhibition plates yet. Check back soon for upcoming collections.
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
            {/* Portfolio Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={{
                    ...post,
                    creator: {
                      profileId: profile.id,
                      username: profile.username,
                      firstName: profile.firstName,
                      lastName: profile.lastName,
                      avatarUrl: profile.avatarUrl,
                    },
                  } as ExplorePostResponse}
                />
              ))}
            </div>

            {/* Pagination / Load More Button */}
            {hasNextPage && (
              <div className="mt-14 text-center">
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
    </div>
  );
};
