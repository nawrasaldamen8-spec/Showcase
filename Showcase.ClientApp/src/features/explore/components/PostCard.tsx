import { Image as ImageIcon, Layers } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";
import type { ExplorePostResponse } from "../../../shared/types/index.ts";

export type TileSpanType = "square" | "tall" | "wide" | "hero";

export interface PostCardProps {
  post: ExplorePostResponse;
  spanType?: TileSpanType;
  className?: string;
  aspectRatio?: "square" | "4/3" | "4/5" | "16/9" | "auto";
}

const SPAN_CLASSES: Record<TileSpanType, string> = {
  square: "col-span-1 row-span-1",
  tall: "col-span-1 row-span-2",
  wide: "col-span-2 row-span-1",
  hero: "col-span-2 row-span-2",
};

const ASPECT_CLASSES: Record<string, string> = {
  square: "aspect-square",
  "4/3": "aspect-[4/3]",
  "4/5": "aspect-[4/5]",
  "16/9": "aspect-[16/9]",
  auto: "",
};

export const PostCard: React.FC<PostCardProps> = ({ post, spanType = "square", className = "", aspectRatio }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/posts/${post.id}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleCardClick();
    }
  };

  const creatorUsername = post.creator?.username || "artist";
  const isAutoAspect = aspectRatio === "auto";
  const spanClass = isAutoAspect ? "" : SPAN_CLASSES[spanType] || SPAN_CLASSES.square;
  const aspectClass = aspectRatio && !isAutoAspect ? ASPECT_CLASSES[aspectRatio] || "" : isAutoAspect ? "" : "h-full";
  const imgHeightClass = isAutoAspect ? "h-auto block" : "h-full";

  return (
    <article
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`View exhibition plate: ${post.title} by @${creatorUsername}`}
      className={`group relative w-full overflow-hidden bg-[#e6e3da] cursor-pointer focus-visible:outline-2 focus-visible:outline-[#141413] shadow-none ${aspectClass} ${spanClass} ${className}`}
    >
      {/* Photography Preview */}
      {post.thumbnailUrl ? (
        <img
          src={post.thumbnailUrl}
          alt={post.title}
          loading="lazy"
          className={`w-full ${imgHeightClass} object-cover transition-transform duration-500 ease-out group-hover:scale-105`}
        />
      ) : (
        <div className="w-full aspect-[4/3] flex flex-col items-center justify-center text-[#87867f] gap-2">
          <ImageIcon className="h-6 w-6 stroke-[1.5]" />
          <span className="font-gothic text-[10px] uppercase tracking-widest">Plate</span>
        </div>
      )}

      {/* Multi-plate indicator (Instagram carousel style - no video indicator) */}
      {post.imageCount > 1 && (
        <div
          className="absolute top-2.5 right-2.5 z-10 pointer-events-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]"
          aria-label={`${post.imageCount} plates`}
        >
          <Layers className="h-4 w-4 sm:h-5 sm:w-5 text-white stroke-[2]" />
        </div>
      )}

      {/* Hover / Focus Overlay (Warm dark overlay displaying plate title & artist) */}
      <div className="absolute inset-0 bg-[#141413]/55 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-3 sm:p-4 text-[#faf9f5]">
        <h3 className="font-gothic text-xs sm:text-sm font-bold uppercase tracking-tight line-clamp-2 text-[#faf9f5] leading-snug">
          {post.title}
        </h3>
        <div className="flex items-center gap-1.5 mt-1 sm:mt-1.5 text-[11px] sm:text-xs text-[#faf9f5]/80 font-serif">
          <span className="truncate">@{creatorUsername}</span>
          {post.imageCount > 1 && (
            <>
              <span className="text-[#faf9f5]/50">•</span>
              <span>{post.imageCount} plates</span>
            </>
          )}
        </div>
      </div>
    </article>
  );
};
