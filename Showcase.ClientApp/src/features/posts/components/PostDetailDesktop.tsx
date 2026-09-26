import { ArrowLeft, ExternalLink, Maximize2, User as UserIcon } from "lucide-react";
import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@shared/components/Badge.tsx";
import { Button } from "@shared/components/Button.tsx";
import { VerifiedBadge } from "@shared/components/VerifiedBadge.tsx";
import type { PostDetailsResponse } from "@shared/types/index.ts";
import { PostLikeButton } from "./PostLikeButton.tsx";

export interface PostDetailDesktopProps {
  post: PostDetailsResponse;
  creatorName: string;
  creatorUsername: string;
  creatorAvatar?: string;
  onInspectImage: (index: number) => void;
}

interface PlateLayoutConfig {
  gridSpan: string;
  aspectRatioClass: string;
}

function getPlateLayoutConfig(secIndex: number, secondaryCount: number): PlateLayoutConfig {
  if (secondaryCount === 1) {
    return {
      gridSpan: "col-span-12",
      aspectRatioClass: "aspect-[16/10] max-h-[650px]",
    };
  }

  if (secondaryCount === 2) {
    if (secIndex === 0) {
      return {
        gridSpan: "col-span-12 md:col-span-5",
        aspectRatioClass: "aspect-[3/4] max-h-[550px]",
      };
    }
    return {
      gridSpan: "col-span-12 md:col-span-7",
      aspectRatioClass: "aspect-[4/3] max-h-[550px]",
    };
  }

  if (secondaryCount === 3) {
    if (secIndex === 0) {
      return {
        gridSpan: "col-span-12 md:col-span-7",
        aspectRatioClass: "aspect-[4/3] max-h-[500px]",
      };
    }
    if (secIndex === 1) {
      return {
        gridSpan: "col-span-12 md:col-span-5",
        aspectRatioClass: "aspect-[3/4] max-h-[500px]",
      };
    }
    return {
      gridSpan: "col-span-12",
      aspectRatioClass: "aspect-[16/9] lg:aspect-[21/9] max-h-[550px]",
    };
  }

  if (secondaryCount === 4) {
    if (secIndex === 0) {
      return {
        gridSpan: "col-span-12 md:col-span-5",
        aspectRatioClass: "aspect-[3/4] max-h-[500px]",
      };
    }
    if (secIndex === 1) {
      return {
        gridSpan: "col-span-12 md:col-span-7",
        aspectRatioClass: "aspect-[4/3] max-h-[500px]",
      };
    }
    return {
      gridSpan: "col-span-12 md:col-span-6",
      aspectRatioClass: "aspect-[4/3] max-h-[480px]",
    };
  }

  // 5+ items: alternating editorial mosaic rhythm
  const patternIndex = secIndex % 5;
  const isLastSingle = secIndex === secondaryCount - 1 && secIndex % 2 === 0;

  if (isLastSingle && patternIndex !== 2) {
    return {
      gridSpan: "col-span-12",
      aspectRatioClass: "aspect-[16/9] lg:aspect-[21/9] max-h-[550px]",
    };
  }

  switch (patternIndex) {
    case 0:
      return {
        gridSpan: "col-span-12 md:col-span-5",
        aspectRatioClass: "aspect-[3/4] max-h-[520px]",
      };
    case 1:
      return {
        gridSpan: "col-span-12 md:col-span-7",
        aspectRatioClass: "aspect-[4/3] max-h-[520px]",
      };
    case 2:
      return {
        gridSpan: "col-span-12",
        aspectRatioClass: "aspect-[16/9] lg:aspect-[21/9] max-h-[550px]",
      };
    case 3:
      return {
        gridSpan: "col-span-12 md:col-span-6",
        aspectRatioClass: "aspect-square sm:aspect-[4/3] max-h-[480px]",
      };
    case 4:
    default:
      return {
        gridSpan: "col-span-12 md:col-span-6",
        aspectRatioClass: "aspect-square sm:aspect-[4/3] max-h-[480px]",
      };
  }
}

export const PostDetailDesktop: React.FC<PostDetailDesktopProps> = ({
  post,
  creatorName,
  creatorUsername,
  creatorAvatar,
  onInspectImage,
}) => {
  const images = post.images || [];
  const primaryImage = images[0];
  const secondaryImages = images.slice(1);

  const secondaryLayouts = useMemo(() => {
    return secondaryImages.map((_, i) => getPlateLayoutConfig(i, secondaryImages.length));
  }, [secondaryImages]);

  return (
    <div className="hidden lg:block space-y-12 lg:space-y-16">
      {/* Main Project Header Section */}
      <section
        aria-label="Project images"
        className="grid grid-cols-12 gap-8 lg:gap-12 xl:gap-16 items-start"
      >
        {/* Primary Cover Plate */}
        <div className="col-span-12 lg:col-span-7">
          {primaryImage ? (
            <figure
              className="group relative rounded-[24px] overflow-hidden bg-[#e6e3da] border border-[#cccbc8]/60 cursor-pointer shadow-none transition-all duration-300 hover:border-[#141413]/40"
              onClick={() => onInspectImage(0)}
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
          ) : (
            <div className="w-full h-[55vh] rounded-[24px] bg-[#e6e3da] border border-[#cccbc8]/60 flex items-center justify-center font-serif text-[#87867f]">
              No media available
            </div>
          )}
        </div>

        {/* Sticky Curatorial Metadata Sidebar */}
        <div className="col-span-12 lg:col-span-5 lg:sticky lg:top-24 space-y-6 lg:space-y-8">
          {/* Creator Identity */}
          <div className="flex items-center gap-3.5">
            <Link to={`/u/${creatorUsername}`} className="shrink-0 group">
              {creatorAvatar ? (
                <img
                  src={creatorAvatar}
                  alt={creatorName}
                  className="h-12 w-12 rounded-full object-cover border border-[#cccbc8] transition-transform group-hover:scale-105"
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-[#141413] text-[#faf9f5] flex items-center justify-center font-gothic text-sm font-bold uppercase transition-transform group-hover:scale-105">
                  {post.creator?.firstName?.[0] || <UserIcon className="h-5 w-5" />}
                </div>
              )}
            </Link>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 min-w-0">
                <Link
                  to={`/u/${creatorUsername}`}
                  className="font-gothic font-bold text-base sm:text-lg uppercase tracking-tight text-[#141413] hover:text-[#d97757] transition-colors truncate leading-tight"
                >
                  {creatorName}
                </Link>
                {post.creator?.isVerified && <VerifiedBadge size="sm" className="shrink-0" />}
              </div>
              <Link
                to={`/u/${creatorUsername}`}
                className="font-serif text-sm text-[#87867f] hover:text-[#d97757] transition-colors truncate block mt-0.5"
              >
                @{creatorUsername}
              </Link>
            </div>
          </div>

          {/* Exhibition Title */}
          <h1 className="font-gothic font-extrabold text-2xl sm:text-3xl lg:text-4xl text-[#141413] tracking-[-0.03em] leading-[1.15]">
            {post.title}
          </h1>

          {/* Action Row: Likes */}
          <div className="flex items-center gap-3 pt-1">
            <PostLikeButton
              postId={post.id}
              initialLiked={post.isLiked}
              initialCount={post.likeCount}
              size="md"
              variant="pill"
            />
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="stone" size="sm">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Curatorial Description */}
          {post.description && (
            <div className="pt-1">
              <p className="font-serif text-[16px] sm:text-[17px] leading-relaxed text-[#141413]/85 whitespace-pre-line max-w-prose">
                {post.description}
              </p>
            </div>
          )}

          {/* External Reference */}
          {post.externalUrl && (
            <div className="pt-1">
              <a
                href={post.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-gothic text-xs font-semibold uppercase tracking-[0.12em] text-[#141413] hover:text-[#d97757] transition-colors border-b border-[#141413] hover:border-[#d97757] pb-0.5"
              >
                <span>Live Project Link</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}

          {/* Profile Button */}
          <div className="pt-4 border-t border-[#cccbc8]/40 flex items-center justify-between">
            <Link to={`/u/${creatorUsername}`} className="inline-block text-decoration-none">
              <Button variant="slate" size="md" rightIcon={<ArrowLeft className="h-3.5 w-3.5 rotate-180" />}>
                View Profile
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Additional Images Section */}
      {secondaryImages.length > 0 && (
        <section aria-label="Additional project images" className="pt-10 sm:pt-14 border-t border-[#cccbc8]/50 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-stretch">
            {secondaryImages.map((image, idx) => {
              const layout = secondaryLayouts[idx];
              const overallIndex = idx + 1;
              return (
                <figure
                  key={image.id || idx}
                  className={`group relative rounded-[24px] overflow-hidden bg-[#e6e3da] border border-[#cccbc8]/50 cursor-pointer shadow-none transition-all duration-300 hover:border-[#141413]/40 ${layout.gridSpan}`}
                  onClick={() => onInspectImage(overallIndex)}
                >
                  <div className={`relative ${layout.aspectRatioClass} w-full overflow-hidden`}>
                    <img
                      src={image.url}
                      alt={`${post.title} - Image ${overallIndex + 1}`}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.01]"
                    />
                    <div className="absolute top-4 right-4 bg-[#141413]/75 backdrop-blur-xs text-[#faf9f5] px-3 py-1.5 rounded-full font-gothic text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Maximize2 className="h-3.5 w-3.5" />
                      <span>Inspect</span>
                    </div>
                  </div>
                </figure>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};
