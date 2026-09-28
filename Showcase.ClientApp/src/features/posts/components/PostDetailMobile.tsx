import { ArrowRight, User as UserIcon } from "lucide-react";
import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { VerifiedBadge } from "@shared/components/VerifiedBadge.tsx";
import { useAdaptiveImageDimensions, useResponsiveViewport } from "@shared/hooks/index.ts";
import type { PostDetailsResponse } from "@shared/types/index.ts";
import { PostCuratorialMeta } from "./PostCuratorialMeta.tsx";

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
    <div className="space-y-5 max-w-3xl mx-auto">
      {/* 1. Creator Header Row */}
      <div className="flex items-center justify-between py-1">
        <Link to={`/u/${creatorUsername}`} className="flex items-center gap-2.5 min-w-0 text-decoration-none group">
          {creatorAvatar ? (
            <img
              src={creatorAvatar}
              alt={creatorName}
              className="h-9 w-9 rounded-full object-cover border border-stone/70 shrink-0"
            />
          ) : (
            <div className="h-9 w-9 rounded-full bg-slate-dark text-ivory-light flex items-center justify-center font-gothic text-xs font-bold uppercase shrink-0">
              {post.creator?.name?.[0] || <UserIcon className="h-4 w-4" />}
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-1 min-w-0">
              <span className="font-gothic text-xs sm:text-sm font-bold uppercase tracking-tight text-slate-dark truncate block group-hover:text-clay transition-colors leading-tight">
                {creatorName}
              </span>
              {post.creator?.isVerified && <VerifiedBadge size="xs" className="shrink-0" />}
            </div>
            <span className="font-serif text-xs text-cloud-dark truncate block leading-none mt-0.5">
              @{creatorUsername}
            </span>
          </div>
        </Link>

        <Link to={`/u/${creatorUsername}`} className="text-decoration-none shrink-0">
          <span className="font-gothic text-[11px] font-semibold uppercase tracking-wider text-slate-dark hover:text-clay transition-colors inline-flex items-center gap-1 bg-slate-dark/5 hover:bg-slate-dark/10 px-2.5 py-1 rounded-full">
            <span>Profile</span>
            <ArrowRight className="h-3 w-3" />
          </span>
        </Link>
      </div>

      {/* 2. Dynamic Adaptive Image Canvas */}
      <div
        style={{
          height: `${calculatedHeight}px`,
          transition: "height 300ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
        className="w-full relative rounded-2xl overflow-hidden bg-[#e6e3da]/70 border border-stone/60 shadow-none select-none"
      >
        {/* Counter Badge: Top Right Corner */}
        {images.length > 1 && (
          <div className="absolute top-3 right-3 z-10 bg-slate-dark/70 backdrop-blur-xs text-ivory-light font-gothic text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-white/15 select-none">
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
                activeSlideIndex === idx ? "w-4 h-1.5 bg-slate-dark" : "w-1.5 h-1.5 bg-stone"
              }`}
            />
          ))}
        </div>
      )}

      {/* 4. Post Details & Curatorial Typography */}
      <PostCuratorialMeta
        post={post}
        creatorName={creatorName}
        creatorUsername={creatorUsername}
        creatorAvatar={creatorAvatar}
        layout="inline"
        showCreator={false}
      />
    </div>
  );
};
