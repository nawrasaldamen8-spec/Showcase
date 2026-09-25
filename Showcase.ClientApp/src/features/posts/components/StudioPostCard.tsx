import { Archive, ExternalLink, Globe, Image as ImageIcon, Pencil, Trash2 } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@shared/components/Button.tsx";
import { PostStatus, type PostSummaryResponse } from "@shared/types/index.ts";
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
  const isPublished = Number(post.status) === PostStatus.Published;
  const hasImages = (post.imageCount || 0) > 0;

  return (
    <div className="bg-[#faf9f5] border border-[#cccbc8] rounded-[24px] p-5 sm:p-6 transition-all duration-200 hover:border-[#141413]/70 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-none">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 w-full md:w-auto flex-1">
        <div className="relative w-full sm:w-40 sm:h-28 h-48 bg-[#f0eee6] rounded-xl overflow-hidden shrink-0 border border-[#cccbc8]/60">
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
            <div className="w-full h-full flex flex-col items-center justify-center text-[#87867f] gap-1 p-2">
              <ImageIcon className="h-6 w-6 stroke-[1.5]" />
              <span className="font-gothic text-[10px] uppercase tracking-wider">No plates</span>
            </div>
          )}

          <div className="absolute bottom-2 right-2 bg-[#141413]/85 text-[#faf9f5] font-gothic text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full backdrop-blur-xs select-none">
            {post.imageCount} {post.imageCount === 1 ? "Plate" : "Plates"}
          </div>
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <PostStatusBadge status={post.status} size="sm" />
            <span className="font-serif text-xs text-[#87867f]">
              {isPublished
                ? `Published ${formatDate(post.publishedAt || post.createdAt)}`
                : `Updated ${formatDate(post.createdAt)}`}
            </span>
          </div>

          <h3 className="font-gothic text-xl sm:text-2xl font-bold tracking-tight text-[#141413]">
            {post.title}
          </h3>

          <p className="font-serif text-sm text-[#141413]/70 line-clamp-2 leading-relaxed">
            {post.description || "No description provided."}
          </p>

          {post.externalUrl && (
            <div className="pt-1">
              <a
                href={post.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-gothic text-[11px] font-semibold uppercase tracking-wider text-[#d97757] hover:underline"
              >
                <span>External Project</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end pt-4 md:pt-0 border-t md:border-t-0 border-[#cccbc8]/50">
        <Link to={`/posts/${post.id}`}>
          <Button
            variant="ghost"
            size="sm"
            title="View Public Presentation"
            aria-label={`View ${post.title}`}
          >
            View
          </Button>
        </Link>

        <Link to={`/posts/${post.id}/edit`}>
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
                : "Publish to public gallery"
          }
        >
          {isPublished ? "Unpublish" : "Publish"}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDeleteClick(post)}
          className="text-[#d97757] hover:bg-[#d97757]/10"
          aria-label={`Delete ${post.title}`}
          title="Delete post"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
