import { ArrowLeft, ExternalLink, User as UserIcon } from "lucide-react";
import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@shared/components/Badge.tsx";
import { Button } from "@shared/components/Button.tsx";
import { VerifiedBadge } from "@shared/components/VerifiedBadge.tsx";
import { useAdaptiveImageDimensions, useResponsiveViewport } from "@shared/hooks/index.ts";
import type { PostDetailsResponse } from "@shared/types/index.ts";
import { PostLikeButton } from "./PostLikeButton.tsx";

export interface PostDetailMobileProps {
  post: PostDetailsResponse;
  creatorName: string;
  creatorUsername: string;
  creatorAvatar?: string;
  onInspectImage: (index: number) => void;
}

export const PostDetailMobile: React.FC<PostDetailMobileProps> = ({
  post,
  creatorName,
  creatorUsername,
  creatorAvatar,
  onInspectImage,
}) => {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  const { height, width } = useResponsiveViewport();
  const { handleImageLoad, calculateOptimalHeight } = useAdaptiveImageDimensions();

  const images = post.images || [];

  // Dynamically calculate optimal height for current active slide based on natural aspect ratio & viewport
  const calculatedHeight = calculateOptimalHeight(
    activeSlideIndex,
    width ? Math.min(width - 32, 720) : 360,
    height || 700,
    360,
    0.68 // Never exceed 68% of screen height
  );

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollLeft, clientWidth } = e.currentTarget;
    if (clientWidth > 0) {
      const newIndex = Math.round(scrollLeft / clientWidth);
      if (newIndex !== activeSlideIndex && newIndex >= 0 && newIndex < images.length) {
        setActiveSlideIndex(newIndex);
      }
    }
  };

  return (
    <div className="block lg:hidden space-y-5 max-w-3xl mx-auto">
      {/* 1. Creator Header Row (Cleanly above the image, no white overlay box) */}
      <div className="flex items-center justify-between py-1">
        <Link to={`/u/${creatorUsername}`} className="flex items-center gap-2.5 min-w-0 text-decoration-none group">
          {creatorAvatar ? (
            <img
              src={creatorAvatar}
              alt={creatorName}
              className="h-9 w-9 rounded-full object-cover border border-[#cccbc8]/70 shrink-0"
            />
          ) : (
            <div className="h-9 w-9 rounded-full bg-[#141413] text-[#faf9f5] flex items-center justify-center font-gothic text-xs font-bold uppercase shrink-0">
              {post.creator?.firstName?.[0] || <UserIcon className="h-4 w-4" />}
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-1 min-w-0">
              <span className="font-gothic text-xs sm:text-sm font-bold uppercase tracking-tight text-[#141413] truncate block group-hover:text-[#d97757] transition-colors leading-tight">
                {creatorName}
              </span>
              {post.creator?.isVerified && <VerifiedBadge size="xs" className="shrink-0" />}
            </div>
            <span className="font-serif text-xs text-[#87867f] truncate block leading-none mt-0.5">
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

      {/* 2. Dynamic Adaptive Image Canvas */}
      <div
        style={{
          height: `${calculatedHeight}px`,
          transition: "height 300ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
        className="w-full relative rounded-2xl overflow-hidden bg-[#e6e3da]/70 border border-[#cccbc8]/60 shadow-none select-none"
      >
        {/* Counter Badge: Top Right Corner */}
        {images.length > 1 && (
          <div className="absolute top-3 right-3 z-10 bg-[#141413]/70 backdrop-blur-xs text-[#faf9f5] font-gothic text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-white/15 select-none">
            {activeSlideIndex + 1} / {images.length}
          </div>
        )}

        {/* Carousel Viewport */}
        <div
          ref={sliderRef}
          onScroll={handleScroll}
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          className="flex flex-row w-full h-full overflow-x-auto snap-x snap-mandatory no-scrollbar touch-pan-x [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {images.map((image, index) => (
            <div
              key={image.id || index}
              onClick={() => onInspectImage(index)}
              className="w-full h-full snap-start snap-always shrink-0 relative flex items-center justify-center cursor-pointer select-none"
            >
              <img
                src={image.url}
                alt={`${post.title} - Image ${index + 1}`}
                onLoad={(e) =>
                  handleImageLoad(index, e.currentTarget.naturalWidth, e.currentTarget.naturalHeight)
                }
                className="max-w-full max-h-full w-auto h-auto object-contain select-none pointer-events-none"
                draggable={false}
              />
            </div>
          ))}
        </div>
      </div>

      {/* 3. External Carousel Dots (Outside the image) */}
      {images.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 py-0.5">
          {images.map((_, idx) => (
            <span
              key={idx}
              className={`transition-all rounded-full ${
                activeSlideIndex === idx ? "w-4 h-1.5 bg-[#141413]" : "w-1.5 h-1.5 bg-[#cccbc8]"
              }`}
            />
          ))}
        </div>
      )}

      {/* 4. Post Details & Curatorial Typography */}
      <div className="space-y-4 pt-1 px-1">
        {/* Interaction Action Row (Like Button) */}
        <div className="flex items-center">
          <PostLikeButton
            postId={post.id}
            initialLiked={post.isLiked}
            initialCount={post.likeCount}
            size="md"
            variant="pill"
          />
        </div>

        {/* Title */}
        <h1 className="font-gothic font-extrabold text-xl sm:text-2xl text-[#141413] tracking-tight leading-snug">
          {post.title}
        </h1>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="stone" size="sm">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Curatorial Description */}
        {post.description && (
          <p className="font-serif text-[15px] sm:text-[16px] leading-relaxed text-[#141413]/85 whitespace-pre-line">
            {post.description}
          </p>
        )}

        {/* External Reference Link */}
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

        {/* View Profile Action */}
        <div className="pt-3 border-t border-[#cccbc8]/40">
          <Link to={`/u/${creatorUsername}`} className="inline-block text-decoration-none w-full sm:w-auto">
            <Button
              variant="slate"
              size="md"
              className="w-full sm:w-auto justify-center"
              rightIcon={<ArrowLeft className="h-3.5 w-3.5 rotate-180" />}
            >
              View Profile
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
