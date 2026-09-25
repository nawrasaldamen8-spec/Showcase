import { ArrowLeft, ExternalLink, Maximize2, User as UserIcon } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";
import { Badge } from "@shared/components/Badge.tsx";
import { Button } from "@shared/components/Button.tsx";
import type { PostDetailsResponse, PostImageDto } from "@shared/types/index.ts";

export interface PostDetailDesktopProps {
  post: PostDetailsResponse;
  creatorName: string;
  creatorUsername: string;
  creatorAvatar?: string;
  primaryImage?: PostImageDto;
  secondaryImages: PostImageDto[];
  onInspectImage: (url: string) => void;
}

export const PostDetailDesktop: React.FC<PostDetailDesktopProps> = ({
  post,
  creatorName,
  creatorUsername,
  creatorAvatar,
  primaryImage,
  secondaryImages,
  onInspectImage,
}) => {
  return (
    <div className="hidden md:block space-y-12 lg:space-y-16">
      <section
        aria-label="Plate exhibition"
        className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 items-start"
      >
        <div className="md:col-span-7 xl:col-span-7">
          {primaryImage && (
            <figure
              className="group relative rounded-[24px] overflow-hidden bg-[#e6e3da] border border-[#cccbc8]/60 cursor-pointer shadow-none"
              onClick={() => onInspectImage(primaryImage.url)}
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
          )}
        </div>

        <div className="md:col-span-5 xl:col-span-5 md:sticky md:top-24 space-y-6 lg:space-y-8">
          <div className="flex items-center gap-3.5">
            <Link to={`/u/${creatorUsername}`} className="shrink-0 group">
              {creatorAvatar ? (
                <img
                  src={creatorAvatar}
                  alt={creatorName}
                  className="h-11 w-11 rounded-full object-cover border border-[#cccbc8] transition-transform group-hover:scale-105"
                />
              ) : (
                <div className="h-11 w-11 rounded-full bg-[#141413] text-[#faf9f5] flex items-center justify-center font-gothic text-sm font-bold uppercase transition-transform group-hover:scale-105">
                  {post.creator?.firstName?.[0] || <UserIcon className="h-5 w-5" />}
                </div>
              )}
            </Link>
            <div className="min-w-0">
              <Link
                to={`/u/${creatorUsername}`}
                className="font-gothic font-bold text-base sm:text-lg uppercase tracking-tight text-[#141413] hover:text-[#d97757] transition-colors truncate block leading-tight"
              >
                {creatorName}
              </Link>
              <Link
                to={`/u/${creatorUsername}`}
                className="font-serif text-sm text-[#87867f] hover:text-[#d97757] transition-colors truncate block mt-0.5"
              >
                @{creatorUsername}
              </Link>
            </div>
          </div>

          <h1 className="font-gothic font-extrabold text-2xl sm:text-3xl lg:text-4xl text-[#141413] tracking-[-0.03em] leading-[1.15]">
            {post.title}
          </h1>

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="stone" size="sm">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {post.description && (
            <div className="pt-1">
              <p className="font-serif text-[16px] sm:text-[17px] leading-relaxed text-[#141413]/85 whitespace-pre-line max-w-prose">
                {post.description}
              </p>
            </div>
          )}

          {post.externalUrl && (
            <div className="pt-1">
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
      </section>

      {secondaryImages.length > 0 && (
        <section aria-label="Additional plates" className="pt-10 sm:pt-12 border-t border-[#cccbc8]/50">
          <div
            className={`grid gap-6 lg:gap-8 ${
              secondaryImages.length === 1 ? "grid-cols-1 max-w-4xl" : "grid-cols-1 md:grid-cols-2"
            }`}
          >
            {secondaryImages.map((image, index) => (
              <figure
                key={image.id || index}
                className="group relative rounded-[24px] overflow-hidden bg-[#e6e3da] border border-[#cccbc8]/50 cursor-pointer shadow-none"
                onClick={() => onInspectImage(image.url)}
              >
                <img
                  src={image.url}
                  alt={`${post.title} - Image ${index + 2}`}
                  loading="lazy"
                  className="w-full h-auto max-h-[65vh] object-cover transition-transform duration-700 ease-out group-hover:scale-[1.01]"
                />
                <div className="absolute top-4 right-4 bg-[#141413]/75 backdrop-blur-xs text-[#faf9f5] px-3 py-1.5 rounded-full font-gothic text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Maximize2 className="h-3.5 w-3.5" />
                  <span>Inspect</span>
                </div>
              </figure>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
