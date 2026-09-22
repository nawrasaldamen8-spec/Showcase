import { ArrowLeft, Calendar, ExternalLink, Layers, Maximize2, SearchX, User as UserIcon, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiClient } from "../../../shared/api/apiClient.ts";
import { Badge } from "../../../shared/components/Badge.tsx";
import { Button } from "../../../shared/components/Button.tsx";
import { Skeleton } from "../../../shared/components/Skeleton.tsx";
import type { PostDetailsResponse, PublicProfileResponse } from "../../../shared/types/index.ts";

function formatDate(isoString?: string | null): string {
  if (!isoString) return "";
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(date);
  } catch {
    return "";
  }
}

export const PostDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [post, setPost] = useState<PostDetailsResponse | null>(null);
  const [creatorProfile, setCreatorProfile] = useState<PublicProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [notFound, setNotFound] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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

  // Loading Skeleton State
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-pulse">
        {/* Back Link Skeleton */}
        <Skeleton variant="text" width={160} height={20} className="mb-8" />

        {/* Hero Asymmetric Header Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pb-10 border-b border-[#cccbc8]/50">
          <div className="lg:col-span-8 space-y-4">
            <Skeleton variant="text" width="40%" height={16} />
            <Skeleton variant="text" width="90%" height={48} />
            <Skeleton variant="text" width="60%" height={48} />
          </div>
          <div className="lg:col-span-4 space-y-3 pt-2">
            <Skeleton variant="text" width="100%" height={20} />
            <Skeleton variant="text" width="80%" height={20} />
            <Skeleton variant="text" width="60%" height={20} />
          </div>
        </div>

        {/* Hero Photography Skeleton */}
        <div className="mt-10">
          <Skeleton variant="rectangular" className="w-full aspect-[16/10] sm:aspect-[21/9] rounded-[24px]" />
        </div>

        {/* Secondary Gallery Skeleton */}
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-8">
            <Skeleton variant="rectangular" className="w-full aspect-[16/10] rounded-[24px]" />
          </div>
          <div className="lg:col-span-4">
            <Skeleton variant="card" className="h-64 rounded-[24px]" />
          </div>
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
              Back to Curated Feed
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
  const creatorBio =
    creatorProfile?.bio ||
    post.creator?.bio ||
    "Spatial and visual practitioner contributing curated photographic plates to the Showcase Archive.";
  const creatorAvatar = creatorProfile?.avatarUrl || post.creator?.avatarUrl;

  return (
    <article className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Editorial Back Navigation */}
      <nav
        className="mb-8 flex items-center gap-2 text-xs font-gothic uppercase tracking-[0.12em]"
        aria-label="Breadcrumb navigation"
      >
        <Link
          to="/explore"
          className="inline-flex items-center gap-1.5 text-[#87867f] hover:text-[#141413] transition-colors group"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
          <span>Curated Feed</span>
        </Link>
        <span className="text-[#cccbc8]">&bull;</span>
        <span className="text-[#141413] font-semibold truncate max-w-sm">{post.title}</span>
      </nav>

      {/* Asymmetric Header Block */}
      <header className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start pb-10 border-b border-[#cccbc8]/60">
        {/* Left Column: Massive VSCO Gothic Title & Metadata */}
        <div className="lg:col-span-8">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="font-gothic text-[11px] font-bold uppercase tracking-[0.16em] text-[#87867f]">
              Plate No. {post.id.slice(-6).toUpperCase()}
            </span>
            <span className="text-[#cccbc8]">&bull;</span>
            <span className="font-gothic text-[11px] font-semibold uppercase tracking-[0.12em] text-[#87867f] inline-flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(post.publishedAt || post.createdAt)}
            </span>
          </div>

          <h1 className="font-gothic font-extrabold text-3xl sm:text-5xl lg:text-6xl text-[#141413] tracking-[-0.04em] leading-[1.05]">
            {post.title}
          </h1>

          {/* Tags Metadata */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-6">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="stone" size="sm">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Editorial Description & External Link in Anthropic Serif */}
        <div className="lg:col-span-4 flex flex-col justify-between gap-6 pt-2">
          {post.description ? (
            <p className="font-serif text-[18px] sm:text-[20px] leading-relaxed text-[#141413]/90 max-w-[68ch]">
              {post.description}
            </p>
          ) : (
            <p className="font-serif text-[17px] italic text-[#87867f]">
              No editorial commentary provided for this plate.
            </p>
          )}

          {/* External Project Link */}
          {post.externalUrl && (
            <div>
              <a
                href={post.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 font-gothic text-xs font-semibold uppercase tracking-[0.12em] text-[#141413] hover:text-[#d97757] transition-colors border-b border-[#141413] hover:border-[#d97757] pb-1"
              >
                <span>Live Project Reference</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          )}
        </div>
      </header>

      {/* Hero Photography Presentation */}
      {primaryImage && (
        <figure className="mt-10 sm:mt-12">
          <div
            className="group relative rounded-[24px] overflow-hidden bg-[#e6e3da] cursor-pointer"
            onClick={() => setActiveLightboxUrl(primaryImage.url)}
          >
            <img
              src={primaryImage.url}
              alt={`${post.title} - Primary Hero Plate`}
              className="w-full max-h-[75vh] object-cover transition-transform duration-700 ease-out group-hover:scale-[1.01]"
            />
            <div className="absolute top-4 right-4 bg-[#141413]/75 backdrop-blur-xs text-[#faf9f5] px-3 py-1.5 rounded-full font-gothic text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <Maximize2 className="h-3.5 w-3.5" />
              <span>Full Size</span>
            </div>
            <div className="absolute bottom-4 left-4 bg-[#faf9f5]/90 backdrop-blur-xs text-[#141413] px-3.5 py-1.5 rounded-full font-gothic text-[11px] font-bold uppercase tracking-wider border border-[#cccbc8]/50">
              Plate 01 &bull; Primary View
            </div>
          </div>
        </figure>
      )}

      {/* Main Body Grid: Secondary Visuals & Creator Attribution Sidebar */}
      <section className="mt-16 sm:mt-20 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        {/* Left 8 Cols: Secondary Images Photographic Flow */}
        <div className="lg:col-span-8 space-y-12 sm:space-y-16">
          {secondaryImages.length > 0 ? (
            secondaryImages.map((image, index) => (
              <figure
                key={image.id || index}
                className="group relative rounded-[24px] overflow-hidden bg-[#e6e3da] border border-[#cccbc8]/40 cursor-pointer"
                onClick={() => setActiveLightboxUrl(image.url)}
              >
                <img
                  src={image.url}
                  alt={`${post.title} - Plate ${String(index + 2).padStart(2, "0")}`}
                  loading="lazy"
                  className="w-full max-h-[70vh] object-cover transition-transform duration-700 ease-out group-hover:scale-[1.01]"
                />
                <div className="absolute top-4 right-4 bg-[#141413]/75 backdrop-blur-xs text-[#faf9f5] px-3 py-1.5 rounded-full font-gothic text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Maximize2 className="h-3.5 w-3.5" />
                  <span>Inspect</span>
                </div>
                <div className="p-4 bg-[#faf9f5] border-t border-[#cccbc8]/40 flex items-center justify-between text-xs font-gothic text-[#87867f] uppercase tracking-wider">
                  <span>Plate {String(index + 2).padStart(2, "0")}</span>
                  <span className="font-serif italic capitalize">Detail Study</span>
                </div>
              </figure>
            ))
          ) : (
            <div className="p-8 bg-[#faf9f5] rounded-[24px] border border-[#cccbc8]/50 text-center">
              <p className="font-serif text-[16px] italic text-[#87867f]">
                This exhibition entry consists of a focused single-plate study.
              </p>
            </div>
          )}
        </div>

        {/* Right 4 Cols: Creator Attribution Card (Sticky) */}
        <aside className="lg:col-span-4 lg:sticky lg:top-28 space-y-6">
          <div className="bg-[#faf9f5] rounded-[24px] border border-[#cccbc8]/60 p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-4">
              {creatorAvatar ? (
                <img
                  src={creatorAvatar}
                  alt={creatorName}
                  className="h-16 w-16 rounded-full object-cover border border-[#cccbc8]"
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-[#141413] text-[#faf9f5] flex items-center justify-center font-gothic text-xl font-bold uppercase">
                  {post.creator?.firstName?.[0] || <UserIcon className="h-6 w-6" />}
                </div>
              )}

              <div>
                <span className="font-gothic text-[10px] font-bold uppercase tracking-[0.16em] text-[#87867f] block">
                  Exhibiting Artist
                </span>
                <h3 className="font-gothic text-lg sm:text-xl font-bold uppercase tracking-tight text-[#141413]">
                  {creatorName}
                </h3>
                <Link
                  to={`/u/${creatorUsername}`}
                  className="font-serif text-sm text-[#87867f] hover:text-[#d97757] hover:underline"
                >
                  @{creatorUsername}
                </Link>
              </div>
            </div>

            {/* Creator Bio Snippet in Anthropic Serif */}
            <p className="font-serif text-[15px] sm:text-[16px] leading-relaxed text-[#141413]/85 border-t border-b border-[#cccbc8]/40 py-4">
              {creatorBio}
            </p>

            {/* Creator Portfolio Direct Navigation */}
            <div>
              <Link to={`/u/${creatorUsername}`} className="block">
                <Button
                  variant="slate"
                  size="md"
                  fullWidth
                  rightIcon={<ArrowLeft className="h-3.5 w-3.5 rotate-180" />}
                >
                  View Artist Portfolio
                </Button>
              </Link>
            </div>
          </div>

          {/* Exhibition Specs Card */}
          <div className="bg-[#faf9f5] rounded-[24px] border border-[#cccbc8]/50 p-6 space-y-3 font-gothic text-xs uppercase tracking-wider text-[#87867f]">
            <div className="flex justify-between items-center pb-2 border-b border-[#cccbc8]/40">
              <span>Collection</span>
              <span className="text-[#141413] font-semibold">Anthropic × VSCO</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-[#cccbc8]/40">
              <span>Total Plates</span>
              <span className="text-[#141413] font-semibold inline-flex items-center gap-1">
                <Layers className="h-3 w-3" />
                {post.images.length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Canvas Tone</span>
              <span className="text-[#141413] font-semibold">Ivory Medium (#f0eee6)</span>
            </div>
          </div>
        </aside>
      </section>

      {/* Fullscreen Lightbox Inspection Modal */}
      {activeLightboxUrl && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Image inspection viewer"
          className="fixed inset-0 z-50 bg-[#141413]/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200"
          onClick={() => setActiveLightboxUrl(null)}
        >
          <button
            type="button"
            onClick={() => setActiveLightboxUrl(null)}
            aria-label="Close image inspector"
            className="absolute top-6 right-6 p-2 rounded-full bg-[#faf9f5]/10 text-[#faf9f5] hover:bg-[#faf9f5]/20 transition-colors cursor-pointer"
          >
            <X className="h-6 w-6" />
          </button>
          <img
            src={activeLightboxUrl}
            alt="Inspected plate detail"
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </article>
  );
};
