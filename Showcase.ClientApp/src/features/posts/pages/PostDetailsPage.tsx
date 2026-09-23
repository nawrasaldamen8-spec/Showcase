import { ArrowLeft, ExternalLink, Maximize2, Pencil, SearchX, User as UserIcon, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiClient } from "../../../shared/api/apiClient.ts";
import { Badge } from "../../../shared/components/Badge.tsx";
import { Button } from "../../../shared/components/Button.tsx";
import { Skeleton } from "../../../shared/components/Skeleton.tsx";
import { useAuth } from "../../../shared/context/index.ts";
import type { PostDetailsResponse, PublicProfileResponse } from "../../../shared/types/index.ts";

export const PostDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();

  const [post, setPost] = useState<PostDetailsResponse | null>(null);
  const [creatorProfile, setCreatorProfile] = useState<PublicProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [notFound, setNotFound] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Mobile vertical snap scroll tracking
  const [activeMobileSlideIndex, setActiveMobileSlideIndex] = useState<number>(0);

  // Lightbox modal state for full-bleed inspection
  const [activeLightboxUrl, setActiveLightboxUrl] = useState<string | null>(null);

  // Close lightbox on Escape key
  useEffect(() => {
    if (!activeLightboxUrl) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveLightboxUrl(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeLightboxUrl]);

  useEffect(() => {
    let isMounted = true;

    async function loadPostData() {
      if (!id) {
        setNotFound(true);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      setNotFound(false);

      try {
        const postData = await apiClient.getPostById(id);
        if (!isMounted) return;
        setPost(postData);

        // Fetch full creator profile to ensure bio snippet & details are rich
        if (postData.creator?.username) {
          try {
            const profile = await apiClient.getPublicProfile(postData.creator.username);
            if (isMounted) {
              setCreatorProfile(profile);
            }
          } catch {
            // Non-critical: postData.creator is available as fallback
          }
        }
      } catch (err: unknown) {
        if (!isMounted) return;
        const status = (err as { status?: number })?.status;
        if (status === 404) {
          setNotFound(true);
        } else {
          setError("Unable to load exhibition plate details. Please try again.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadPostData();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleMobileScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollLeft, clientWidth } = e.currentTarget;
    if (clientWidth > 0) {
      const index = Math.round(scrollLeft / clientWidth);
      setActiveMobileSlideIndex(index);
    }
  };

  // Loading Skeleton State
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 animate-pulse">
        {/* Back Link Skeleton */}
        <Skeleton variant="text" width={100} height={20} className="mb-8" />

        {/* Desktop Two-Column Hero Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 items-start">
          <div className="md:col-span-7 xl:col-span-7">
            <Skeleton variant="rectangular" className="w-full h-[55vh] max-h-[600px] rounded-[24px]" />
          </div>
          <div className="md:col-span-5 xl:col-span-5 space-y-6">
            <div className="flex items-center gap-3">
              <Skeleton variant="circular" width={44} height={44} />
              <div className="space-y-1.5 flex-1">
                <Skeleton variant="text" width="60%" height={16} />
                <Skeleton variant="text" width="40%" height={14} />
              </div>
            </div>
            <Skeleton variant="text" width="85%" height={36} />
            <div className="flex gap-2">
              <Skeleton variant="rectangular" width={70} height={24} className="rounded-full" />
              <Skeleton variant="rectangular" width={80} height={24} className="rounded-full" />
            </div>
            <Skeleton variant="text" width="100%" height={18} />
            <Skeleton variant="text" width="90%" height={18} />
            <Skeleton variant="text" width="75%" height={18} />
            <Skeleton variant="rectangular" width={140} height={40} className="rounded-full mt-4" />
          </div>
        </div>

        {/* Secondary Images Skeleton */}
        <div className="mt-12 pt-10 border-t border-[#cccbc8]/50 grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          <Skeleton variant="rectangular" className="w-full h-64 rounded-[24px]" />
          <Skeleton variant="rectangular" className="w-full h-64 rounded-[24px]" />
        </div>
      </div>
    );
  }

  // 404 Not Found State
  if (notFound || !post) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20 text-center">
        <div className="inline-flex items-center justify-center p-4 rounded-full bg-[#f0eee6] text-[#87867f] mb-6">
          <SearchX className="h-10 w-10 stroke-[1.5]" />
        </div>
        <span className="font-gothic text-xs font-bold uppercase tracking-[0.16em] text-[#87867f] block mb-2">
          Error 404 &bull; Plate Unavailable
        </span>
        <h1 className="font-gothic text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-[#141413]">
          Exhibition Plate Not Found
        </h1>
        <p className="font-serif text-[18px] text-[#141413]/80 mt-4 leading-relaxed max-w-lg mx-auto">
          The requested portfolio work may have been moved, set to draft status by its author, or never existed in this
          gallery collection.
        </p>
        <div className="mt-8">
          <Link to="/explore">
            <Button variant="slate" size="md" leftIcon={<ArrowLeft className="h-4 w-4" />}>
              Back to Explore
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
                Back to Explore
              </Button>
            </Link>
            <Button variant="slate" size="sm" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const primaryImage = post.images[0];
  const secondaryImages = post.images.slice(1);

  const creatorName = post.creator ? `${post.creator.firstName} ${post.creator.lastName}` : "Unknown Artist";
  const creatorUsername = post.creator?.username || "artist";
  const creatorAvatar = creatorProfile?.avatarUrl || post.creator?.avatarUrl;

  const isOwnPost = Boolean(
    currentUser?.username &&
    post.creator?.username &&
    currentUser.username.toLowerCase() === post.creator.username.toLowerCase(),
  );

  return (
    <article className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* 1. Minimal Top Navigation */}
      <nav
        className="mb-8 sm:mb-10 flex items-center justify-between gap-4 text-xs font-gothic uppercase tracking-[0.12em]"
        aria-label="Main navigation"
      >
        <Link
          to="/explore"
          className="inline-flex items-center gap-2 text-[#87867f] hover:text-[#141413] transition-colors group shrink-0 font-medium"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span>Explore</span>
        </Link>

        {isOwnPost && (
          <Link to={`/posts/${post.id}/edit`} className="shrink-0 text-decoration-none">
            <Button variant="outline" size="sm" leftIcon={<Pencil className="h-3.5 w-3.5" />}>
              Edit
            </Button>
          </Link>
        )}
      </nav>

      {/* 2. Mobile Experience (< md): Single Viewport Snap Carousel + Single Column Info */}
      <div className="block md:hidden space-y-8">
        <div className="relative w-full h-[68vh] sm:h-[74vh] max-h-[640px] rounded-[24px] overflow-hidden bg-[#e6e3da] border border-[#cccbc8]/60 shadow-none">
          {/* Floating Creator Header integrated directly at top of viewport */}
          <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between p-3.5 bg-[#faf9f5]/90 backdrop-blur-md border-b border-[#cccbc8]/40">
            <Link to={`/u/${creatorUsername}`} className="flex items-center gap-2.5 min-w-0 text-decoration-none group">
              {creatorAvatar ? (
                <img
                  src={creatorAvatar}
                  alt={creatorName}
                  className="h-8 w-8 rounded-full object-cover border border-[#cccbc8]/70 shrink-0"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-[#141413] text-[#faf9f5] flex items-center justify-center font-gothic text-xs font-bold uppercase shrink-0">
                  {post.creator?.firstName?.[0] || <UserIcon className="h-4 w-4" />}
                </div>
              )}
              <div className="min-w-0">
                <span className="font-gothic text-xs font-bold uppercase tracking-tight text-[#141413] truncate block group-hover:text-[#d97757] transition-colors leading-tight">
                  {creatorName}
                </span>
                <span className="font-serif text-[11px] text-[#87867f] truncate block leading-none mt-0.5">
                  @{creatorUsername}
                </span>
              </div>
            </Link>

            <Link to={`/u/${creatorUsername}`} className="text-decoration-none shrink-0">
              <span className="font-gothic text-[11px] font-semibold uppercase tracking-wider text-[#141413] hover:text-[#d97757] transition-colors inline-flex items-center gap-1 bg-[#141413]/5 hover:bg-[#141413]/10 px-2.5 py-1 rounded-full">
                <span>Profile</span>
                <ArrowLeft className="h-3 w-3 rotate-180" />
              </span>
            </Link>
          </div>

          {/* Horizontal Scroll Snap Container (Left-Right Swipe) */}
          <div
            onScroll={handleMobileScroll}
            className="flex flex-row w-full h-full overflow-x-auto snap-x snap-mandatory no-scrollbar touch-pan-x"
          >
            {post.images.map((image, index) => (
              <div
                key={image.id || index}
                onClick={() => setActiveLightboxUrl(image.url)}
                className="w-full h-full snap-start snap-always shrink-0 relative flex items-center justify-center bg-[#e6e3da] cursor-pointer select-none"
              >
                <img
                  src={image.url}
                  alt={`${post.title} - Image ${index + 1}`}
                  className="w-full h-full object-cover select-none pointer-events-none"
                  draggable={false}
                />
              </div>
            ))}
          </div>

          {/* Carousel Pagination Dots (Center Bottom) */}
          {post.images.length > 1 && (
            <div className="absolute bottom-3.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#141413]/55 backdrop-blur-xs pointer-events-none">
              {post.images.map((_, idx) => (
                <span
                  key={idx}
                  className={`transition-all rounded-full ${
                    activeMobileSlideIndex === idx ? "w-3.5 h-1.5 bg-[#faf9f5]" : "w-1.5 h-1.5 bg-[#faf9f5]/50"
                  }`}
                />
              ))}
            </div>
          )}

          {/* Floating Plate Counter & Lightbox Cue */}
          <div className="absolute bottom-3.5 right-3.5 z-20 flex items-center gap-2">
            {post.images.length > 1 && (
              <div className="bg-[#141413]/75 backdrop-blur-xs text-[#faf9f5] font-gothic text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-white/10 select-none">
                {activeMobileSlideIndex + 1} / {post.images.length}
              </div>
            )}
            <button
              type="button"
              onClick={() => setActiveLightboxUrl(post.images[activeMobileSlideIndex]?.url || post.images[0]?.url)}
              className="bg-[#141413]/75 backdrop-blur-xs text-[#faf9f5] p-1.5 rounded-full hover:bg-[#141413] transition-colors cursor-pointer"
              aria-label="Inspect full size"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Mobile Info Flow */}
        <div className="space-y-6 pt-2">
          {/* Title */}
          <h1 className="font-gothic font-extrabold text-2xl sm:text-3xl text-[#141413] tracking-[-0.03em] leading-[1.15]">
            {post.title}
          </h1>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Link key={tag} to={`/explore?tag=${encodeURIComponent(tag)}`} className="text-decoration-none">
                  <Badge
                    variant="stone"
                    size="sm"
                    className="hover:border-[#141413] hover:text-[#141413] transition-colors cursor-pointer"
                  >
                    {tag}
                  </Badge>
                </Link>
              ))}
            </div>
          )}

          {/* Description */}
          {post.description && (
            <p className="font-serif text-[16px] leading-relaxed text-[#141413]/85 whitespace-pre-line">
              {post.description}
            </p>
          )}

          {/* External Link */}
          {post.externalUrl && (
            <div>
              <a
                href={post.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-gothic text-xs font-semibold uppercase tracking-[0.12em] text-[#141413] hover:text-[#d97757] transition-colors border-b border-[#141413] hover:border-[#d97757] pb-0.5"
              >
                <span>Live Project Reference</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}

          {/* View Profile Action */}
          <div className="pt-4 border-t border-[#cccbc8]/40">
            <Link to={`/u/${creatorUsername}`} className="inline-block text-decoration-none">
              <Button variant="slate" size="md" rightIcon={<ArrowLeft className="h-3.5 w-3.5 rotate-180" />}>
                View Profile
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Desktop Experience (>= md): Horizontal Two-Column Hero + Secondary Gallery Row */}
      <div className="hidden md:block space-y-12 lg:space-y-16">
        {/* Hero Area: Main Image (Left ~60-65%) + Unboxed Sticky Info (Right ~35-40%) */}
        <section
          aria-label="Plate exhibition"
          className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 items-start"
        >
          {/* Left Column: Main Image */}
          <div className="md:col-span-7 xl:col-span-7">
            {primaryImage && (
              <figure
                className="group relative rounded-[24px] overflow-hidden bg-[#e6e3da] border border-[#cccbc8]/60 cursor-pointer shadow-none"
                onClick={() => setActiveLightboxUrl(primaryImage.url)}
              >
                <img
                  src={primaryImage.url}
                  alt={post.title}
                  fetchPriority="high"
                  className="w-full h-auto max-h-[75vh] object-cover transition-transform duration-700 ease-out group-hover:scale-[1.01]"
                />
                <div className="absolute top-4 right-4 bg-[#141413]/75 backdrop-blur-xs text-[#faf9f5] px-3 py-1.5 rounded-full font-gothic text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Maximize2 className="h-3.5 w-3.5" />
                  <span>Inspect</span>
                </div>
              </figure>
            )}
          </div>

          {/* Right Column: Unboxed Information (Sticky) */}
          <div className="md:col-span-5 xl:col-span-5 md:sticky md:top-24 space-y-6 lg:space-y-8">
            {/* Creator Attribution */}
            <div className="flex items-center gap-3.5">
              <Link to={`/u/${creatorUsername}`} className="shrink-0 group">
                {creatorAvatar ? (
                  <img
                    src={creatorAvatar}
                    alt={creatorName}
                    className="h-11 w-11 rounded-full object-cover border border-[#cccbc8] transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="h-11 w-11 rounded-full bg-[#141413] text-[#faf9f5] flex items-center justify-center font-gothic text-sm font-bold uppercase transition-transform group-hover:scale-105">
                    {post.creator?.firstName?.[0] || <UserIcon className="h-5 w-5" />}
                  </div>
                )}
              </Link>
              <div className="min-w-0">
                <Link
                  to={`/u/${creatorUsername}`}
                  className="font-gothic font-bold text-base sm:text-lg uppercase tracking-tight text-[#141413] hover:text-[#d97757] transition-colors truncate block leading-tight"
                >
                  {creatorName}
                </Link>
                <Link
                  to={`/u/${creatorUsername}`}
                  className="font-serif text-sm text-[#87867f] hover:text-[#d97757] transition-colors truncate block mt-0.5"
                >
                  @{creatorUsername}
                </Link>
              </div>
            </div>

            {/* Post Title */}
            <h1 className="font-gothic font-extrabold text-2xl sm:text-3xl lg:text-4xl text-[#141413] tracking-[-0.03em] leading-[1.15]">
              {post.title}
            </h1>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {post.tags.map((tag) => (
                  <Link key={tag} to={`/explore?tag=${encodeURIComponent(tag)}`} className="text-decoration-none">
                    <Badge
                      variant="stone"
                      size="sm"
                      className="hover:border-[#141413] hover:text-[#141413] transition-colors cursor-pointer"
                    >
                      {tag}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}

            {/* Description */}
            {post.description && (
              <div className="pt-1">
                <p className="font-serif text-[16px] sm:text-[17px] leading-relaxed text-[#141413]/85 whitespace-pre-line max-w-prose">
                  {post.description}
                </p>
              </div>
            )}

            {/* External Live Link */}
            {post.externalUrl && (
              <div className="pt-1">
                <a
                  href={post.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-gothic text-xs font-semibold uppercase tracking-[0.12em] text-[#141413] hover:text-[#d97757] transition-colors border-b border-[#141413] hover:border-[#d97757] pb-0.5"
                >
                  <span>Live Project Reference</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}

            {/* View Profile Action */}
            <div className="pt-4 border-t border-[#cccbc8]/40">
              <Link to={`/u/${creatorUsername}`} className="inline-block text-decoration-none">
                <Button variant="slate" size="md" rightIcon={<ArrowLeft className="h-3.5 w-3.5 rotate-180" />}>
                  View Profile
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Secondary Images Gallery Row (Images 02, 03, etc.) */}
        {secondaryImages.length > 0 && (
          <section aria-label="Additional plates" className="pt-10 sm:pt-12 border-t border-[#cccbc8]/50">
            <div
              className={`grid gap-6 lg:gap-8 ${
                secondaryImages.length === 1 ? "grid-cols-1 max-w-4xl" : "grid-cols-1 md:grid-cols-2"
              }`}
            >
              {secondaryImages.map((image, index) => (
                <figure
                  key={image.id || index}
                  className="group relative rounded-[24px] overflow-hidden bg-[#e6e3da] border border-[#cccbc8]/50 cursor-pointer shadow-none"
                  onClick={() => setActiveLightboxUrl(image.url)}
                >
                  <img
                    src={image.url}
                    alt={`${post.title} - Image ${index + 2}`}
                    loading="lazy"
                    className="w-full h-auto max-h-[65vh] object-cover transition-transform duration-700 ease-out group-hover:scale-[1.01]"
                  />
                  <div className="absolute top-4 right-4 bg-[#141413]/75 backdrop-blur-xs text-[#faf9f5] px-3 py-1.5 rounded-full font-gothic text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Maximize2 className="h-3.5 w-3.5" />
                    <span>Inspect</span>
                  </div>
                </figure>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Fullscreen Lightbox Inspection Modal */}
      {activeLightboxUrl && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Image inspection viewer"
          tabIndex={-1}
          className="fixed inset-0 z-50 bg-[#141413]/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200 outline-none"
          onClick={() => setActiveLightboxUrl(null)}
        >
          <button
            type="button"
            onClick={() => setActiveLightboxUrl(null)}
            aria-label="Close image inspector"
            className="absolute top-6 right-6 p-2 rounded-full bg-[#faf9f5]/10 text-[#faf9f5] hover:bg-[#faf9f5]/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#faf9f5] transition-colors cursor-pointer"
          >
            <X className="h-6 w-6" />
          </button>
          <img
            src={activeLightboxUrl}
            alt="Inspected plate detail"
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg select-none shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </article>
  );
};
