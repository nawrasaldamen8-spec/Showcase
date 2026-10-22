import React from "react";
import { PoritySymbol } from "@shared/components/BrandLogo.tsx";
import { UserAvatar } from "@shared/components/media/index.ts";
import { VerifiedBadge } from "@shared/components/VerifiedBadge.tsx";
import type { PostDetailsResponse } from "@shared/types/index.ts";
import { getOptimizedImageUrl } from "@shared/utils/mediaUrl.ts";

export interface PostShareCardProps {
  post: PostDetailsResponse;
  creatorName: string;
  creatorUsername: string;
  creatorAvatar?: string;
  className?: string;
}

export const PostShareCard: React.FC<PostShareCardProps> = ({
  post,
  creatorName,
  creatorUsername,
  creatorAvatar,
  className = "",
}) => {
  const primaryImage = post.images?.[0];
  const coverUrl = primaryImage?.url ? getOptimizedImageUrl(primaryImage.url, "detail") : null;

  return (
    <div
      className={`relative bg-ivory-light border border-stone/80 rounded-2xl p-4 sm:p-5 text-slate-dark shadow-sm overflow-hidden select-none ${className}`}
    >
      {/* Top: Pority Logo Symbol Alone */}
      <div className="mb-3 sm:mb-3.5 flex items-center justify-start">
        <PoritySymbol className="h-6 sm:h-7 w-auto text-slate-dark" />
      </div>

      {/* Project Cover Image */}
      {coverUrl ? (
        <div className="w-full aspect-[16/10] max-h-[200px] sm:max-h-[220px] rounded-xl overflow-hidden bg-[#e6e3da] border border-stone/60">
          <img
            src={coverUrl}
            alt={post.title}
            className="w-full h-full object-cover"
            loading="eager"
            crossOrigin="anonymous"
          />
        </div>
      ) : (
        <div className="w-full aspect-[16/10] max-h-[160px] rounded-xl bg-[#e6e3da] border border-stone/60 flex items-center justify-center font-serif text-cloud-dark text-sm">
          No cover image
        </div>
      )}

      {/* Project Title */}
      <div className="mt-3">
        <h2 className="font-gothic font-extrabold text-base sm:text-lg text-slate-dark tracking-[-0.02em] line-clamp-2 leading-snug">
          {post.title}
        </h2>
      </div>

      {/* Creator Identity Footer */}
      <div className="mt-3 pt-3 border-t border-stone/40 flex items-center gap-3">
        <UserAvatar
          src={creatorAvatar}
          alt={creatorName}
          size="md"
          className="border border-stone shrink-0"
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-gothic font-bold text-xs sm:text-sm text-slate-dark truncate uppercase tracking-tight">
              {creatorName}
            </span>
            {post.creator?.isVerified && (
              <VerifiedBadge size="xs" className="shrink-0" />
            )}
          </div>
          <span className="font-serif text-xs text-cloud-dark truncate block mt-0.5">
            @{creatorUsername}
          </span>
        </div>
      </div>
    </div>
  );
};
