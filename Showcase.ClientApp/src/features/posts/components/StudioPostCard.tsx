import { Archive, ExternalLink, Globe, Image as ImageIcon, Pencil, Trash2 } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@shared/components/Button.tsx";
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

  return (
    <div className="bg-ivory-light border border-stone rounded-card p-5 sm:p-6 transition-all duration-200 hover:border-slate-dark/70 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 sm:gap-6 shadow-none">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 w-full lg:w-auto flex-1">
        <div className="relative w-full sm:w-40 sm:h-28 h-48 bg-ivory-medium rounded-xl overflow-hidden shrink-0 border border-stone/60">
          {post.thumbnailUrl ? (
            <img
              src={post.thumbnailUrl}
              alt={post.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80";
              }}
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
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <PostStatusBadge status={post.status} size="sm" />
            <span className="font-serif text-xs text-cloud-dark">
              {isPublished
                ? `Published ${formatDate(post.publishedAt || post.createdAt)}`
                : `Updated ${formatDate(post.createdAt)}`}
            </span>
          </div>

          <h3 className="font-gothic text-xl sm:text-2xl font-bold tracking-tight text-slate-dark">
            {post.title}
          </h3>

          <p className="font-serif text-sm text-slate-dark/70 line-clamp-2 leading-relaxed">
            {post.description || "No description provided."}
          </p>

          {post.externalUrl && (
            <div className="pt-1">
              <a
                href={post.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-gothic text-[11px] font-semibold uppercase tracking-wider text-clay hover:underline"
              >
                <span>Live Link</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 w-full lg:w-auto justify-end pt-3 lg:pt-0 border-t lg:border-t-0 border-stone/50">
        <Link to={`/posts/${post.id}`} state={{ from: "/studio", fromLabel: "Studio" }}>
          <Button
            variant="ghost"
            size="sm"
            title="View Project"
            aria-label={`View ${post.title}`}
          >
            View
          </Button>
        </Link>

        <Link to={`/posts/${post.id}/edit`} state={{ from: "/studio", fromLabel: "Studio" }}>
          <Button variant="outline" size="sm" leftIcon={<Pencil className="h-3.5 w-3.5" />}>
            Edit
          </Button>
        </Link>

        <Button
          variant={isPublished ? "outline" : "clay"}
          size="sm"
          isLoading={isActionRunning}
          onClick={() => onTogglePublish(post)}
          leftIcon={isPublished ? <Archive className="h-3.5 w-3.5" /> : <Globe className="h-3.5 w-3.5" />}
          title={
            !isPublished && !hasImages
              ? "Requires at least 1 image to publish"
              : isPublished
                ? "Unpublish post"
                : "Publish project"
          }
        >
          {isPublished ? "Unpublish" : "Publish"}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDeleteClick(post)}
          className="text-clay hover:bg-clay/10"
          aria-label={`Delete ${post.title}`}
          title="Delete post"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
