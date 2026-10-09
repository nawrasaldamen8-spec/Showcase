import { Archive, Eye, Globe, Image as ImageIcon, MoreVertical, Pencil, Trash2 } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@shared/components/Button.tsx";
import { ProgressiveImage } from "@shared/components/ProgressiveImage.tsx";
import { type PostSummaryResponse } from "@shared/types/index.ts";
import { isPostPublished } from "../utils.ts";
import { PostStatusBadge } from "./PostStatusBadge.tsx";

function formatDate(isoString?: string | null): string {
  if (!isoString) return "Undated";
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  } catch {
    return "Undated";
  }
}

export interface StudioPostCardProps {
  post: PostSummaryResponse;
  isActionRunning: boolean;
  onTogglePublish: (post: PostSummaryResponse) => void;
  onDeleteClick: (post: PostSummaryResponse) => void;
}

export const StudioPostCard: React.FC<StudioPostCardProps> = ({
  post,
  isActionRunning,
  onTogglePublish,
  onDeleteClick,
}) => {
  const isPublished = isPostPublished(post.status);
  const hasImages = (post.imageCount || 0) > 0;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

  return (
    <div className="bg-ivory-light border border-stone rounded-card p-4 sm:p-6 transition-all duration-200 hover:border-slate-dark/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 shadow-none">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5 w-full sm:w-auto flex-1 min-w-0">
        <Link
          to={`/posts/${post.id}`}
          state={{ from: "/studio", fromLabel: "Studio" }}
          className="relative w-full sm:w-36 sm:h-24 h-44 bg-ivory-medium rounded-xl overflow-hidden shrink-0 border border-stone/60 group block"
          tabIndex={0}
          aria-label={`View ${post.title}`}
        >
          {post.thumbnailUrl ? (
            <ProgressiveImage
              src={post.thumbnailUrl}
              alt={post.title}
              variant="thumb"
              containerClassName="w-full h-full"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-cloud-dark gap-1 p-2">
              <ImageIcon className="h-6 w-6 stroke-[1.5]" />
              <span className="font-gothic text-[10px] uppercase tracking-wider">No images</span>
            </div>
          )}

          <div className="absolute bottom-2 right-2 bg-slate-dark/85 text-ivory-light font-gothic text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full backdrop-blur-xs select-none">
            {post.imageCount} {post.imageCount === 1 ? "Image" : "Images"}
          </div>
        </Link>

        <div className="flex-1 min-w-0 space-y-1.5 w-full">
          <div className="flex flex-wrap items-center gap-2">
            <PostStatusBadge status={post.status} size="sm" />
            <span className="font-serif text-xs text-cloud-dark">
              {isPublished
                ? `Published ${formatDate(post.publishedAt || post.createdAt)}`
                : `Updated ${formatDate(post.createdAt)}`}
            </span>
          </div>

          <h3 className="font-gothic text-lg sm:text-xl font-bold tracking-tight text-slate-dark truncate">
            <Link
              to={`/posts/${post.id}`}
              state={{ from: "/studio", fromLabel: "Studio" }}
              className="hover:text-clay transition-colors"
            >
              {post.title}
            </Link>
          </h3>

          <p className="font-serif text-xs sm:text-sm text-slate-dark/70 line-clamp-1 sm:line-clamp-2 leading-relaxed">
            {post.description || "No description provided."}
          </p>
        </div>
      </div>

      {/* Primary Action + 3-Dot Menu */}
      <div className="flex items-center justify-end gap-2 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone/40">
        <Link
          to={`/posts/${post.id}/edit`}
          state={{ from: "/studio", fromLabel: "Studio" }}
          className="flex-1 sm:flex-initial"
        >
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Pencil className="h-3.5 w-3.5" />}
            className="w-full sm:w-auto justify-center"
          >
            Edit
          </Button>
        </Link>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-haspopup="true"
            aria-expanded={isMenuOpen}
            aria-label={`Options for ${post.title}`}
            className="p-2 rounded-xl text-cloud-dark hover:text-slate-dark hover:bg-stone/30 transition-colors border border-stone/60 cursor-pointer"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-48 bg-ivory-light border border-stone rounded-xl p-1.5 z-30 flex flex-col gap-0.5 animate-in fade-in zoom-in-95">
              <Link
                to={`/posts/${post.id}`}
                state={{ from: "/studio", fromLabel: "Studio" }}
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg font-gothic text-xs font-semibold uppercase tracking-wider text-slate-dark hover:bg-stone/25 transition-colors"
              >
                <Eye className="h-3.5 w-3.5 text-cloud-dark" />
                <span>View Exhibition</span>
              </Link>

              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onTogglePublish(post);
                }}
                disabled={isActionRunning || (!isPublished && !hasImages)}
                title={
                  !isPublished && !hasImages
                    ? "Requires at least 1 image to publish"
                    : undefined
                }
                className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg font-gothic text-xs font-semibold uppercase tracking-wider text-slate-dark hover:bg-stone/25 transition-colors text-left cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isPublished ? (
                  <Archive className="h-3.5 w-3.5 text-cloud-dark" />
                ) : (
                  <Globe className="h-3.5 w-3.5 text-cloud-dark" />
                )}
                <span>{isPublished ? "Unpublish" : "Publish"}</span>
              </button>

              <div className="h-px bg-stone/50 my-1" />

              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onDeleteClick(post);
                }}
                className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg font-gothic text-xs font-semibold uppercase tracking-wider text-clay hover:bg-clay/10 transition-colors text-left cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
