import { ArrowLeft, ExternalLink, Maximize2, User as UserIcon } from "lucide-react";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@shared/components/Badge.tsx";
import { Button } from "@shared/components/Button.tsx";
import type { PostDetailsResponse } from "@shared/types/index.ts";

export interface PostDetailMobileProps {
  post: PostDetailsResponse;
  creatorName: string;
  creatorUsername: string;
  creatorAvatar?: string;
  onInspectImage: (url: string) => void;
}

export const PostDetailMobile: React.FC<PostDetailMobileProps> = ({
  post,
  creatorName,
  creatorUsername,
  creatorAvatar,
  onInspectImage,
}) => {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollLeft, clientWidth } = e.currentTarget;
    if (clientWidth > 0) {
      setActiveSlideIndex(Math.round(scrollLeft / clientWidth));
    }
  };

  return (
    <div className="block md:hidden space-y-8">
      <div className="relative w-full h-[68vh] sm:h-[74vh] max-h-[640px] rounded-[24px] overflow-hidden bg-[#e6e3da] border border-[#cccbc8]/60 shadow-none">
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

        <div
          onScroll={handleScroll}
          className="flex flex-row w-full h-full overflow-x-auto snap-x snap-mandatory no-scrollbar touch-pan-x"
        >
          {post.images.map((image, index) => (
            <div
              key={image.id || index}
              onClick={() => onInspectImage(image.url)}
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

        {post.images.length > 1 && (
          <div className="absolute bottom-3.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#141413]/55 backdrop-blur-xs pointer-events-none">
            {post.images.map((_, idx) => (
              <span
                key={idx}
                className={`transition-all rounded-full ${
                  activeSlideIndex === idx ? "w-3.5 h-1.5 bg-[#faf9f5]" : "w-1.5 h-1.5 bg-[#faf9f5]/50"
                }`}
              />
            ))}
          </div>
        )}

        <div className="absolute bottom-3.5 right-3.5 z-20 flex items-center gap-2">
          {post.images.length > 1 && (
            <div className="bg-[#141413]/75 backdrop-blur-xs text-[#faf9f5] font-gothic text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-white/10 select-none">
              {activeSlideIndex + 1} / {post.images.length}
            </div>
          )}
          <button
            type="button"
            onClick={() => onInspectImage(post.images[activeSlideIndex]?.url || post.images[0]?.url)}
            className="bg-[#141413]/75 backdrop-blur-xs text-[#faf9f5] p-1.5 rounded-full hover:bg-[#141413] transition-colors cursor-pointer"
            aria-label="Inspect full size"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="space-y-6 pt-2">
        <h1 className="font-gothic font-extrabold text-2xl sm:text-3xl text-[#141413] tracking-[-0.03em] leading-[1.15]">
          {post.title}
        </h1>

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="stone" size="sm">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {post.description && (
          <p className="font-serif text-[16px] leading-relaxed text-[#141413]/85 whitespace-pre-line">
            {post.description}
          </p>
        )}

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

        <div className="pt-4 border-t border-[#cccbc8]/40">
          <Link to={`/u/${creatorUsername}`} className="inline-block text-decoration-none">
            <Button variant="slate" size="md" rightIcon={<ArrowLeft className="h-3.5 w-3.5 rotate-180" />}>
              View Profile
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
