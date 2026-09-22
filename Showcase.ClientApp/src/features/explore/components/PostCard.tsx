import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Layers, Image as ImageIcon } from 'lucide-react';
import type { ExplorePostResponse } from '../../../shared/types/index.ts';
import { Badge } from '../../../shared/components/Badge.tsx';

export interface PostCardProps {
  post: ExplorePostResponse;
}

function formatDate(isoString?: string | null): string {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  } catch {
    return '';
  }
}

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/posts/${post.id}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick();
    }
  };

  const creatorName = post.creator
    ? `${post.creator.firstName} ${post.creator.lastName}`
    : 'Unknown Artist';

  const creatorUsername = post.creator?.username || 'artist';

  return (
    <article
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`View exhibition plate: ${post.title}`}
      className="group bg-[#faf9f5] rounded-[24px] overflow-hidden border border-[#cccbc8]/50 flex flex-col transition-all duration-300 hover:border-[#141413]/50 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#141413]"
    >
      {/* Visual Photography Preview */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#e6e3da]">
        {post.thumbnailUrl ? (
          <img
            src={post.thumbnailUrl}
            alt={post.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-[#87867f] gap-2">
            <ImageIcon className="h-8 w-8 stroke-[1.5]" />
            <span className="font-gothic text-xs uppercase tracking-widest">Plate Preview</span>
          </div>
        )}

        {/* Image Count Badge */}
        {post.imageCount > 0 && (
          <div className="absolute bottom-3 right-3">
            <Badge
              variant="slate"
              size="sm"
              icon={<Layers className="h-3 w-3 mr-1" />}
              className="bg-[#141413]/90 backdrop-blur-xs text-[#faf9f5]"
            >
              {post.imageCount} {post.imageCount === 1 ? 'Plate' : 'Plates'}
            </Badge>
          </div>
        )}
      </div>

      {/* Editorial Content Block (24px padding) */}
      <div className="p-6 flex flex-col flex-1 justify-between gap-4">
        <div className="space-y-2">
          {/* Post Title in VSCO Gothic 24px */}
          <h2 className="font-gothic text-[24px] font-semibold text-[#141413] leading-snug tracking-[-0.02em] line-clamp-1 group-hover:text-[#d97757] transition-colors">
            {post.title}
          </h2>

          {/* Description Snippet in Anthropic Serif */}
          {post.description && (
            <p className="font-serif text-[#141413]/80 text-[15px] sm:text-[16px] leading-relaxed line-clamp-2">
              {post.description}
            </p>
          )}

          {/* Metadata Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {post.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="font-gothic text-[10px] font-semibold uppercase tracking-wider text-[#87867f] bg-[#cccbc8]/30 px-2 py-0.5 rounded-[999px]"
                >
                  {tag}
                </span>
              ))}
              {post.tags.length > 3 && (
                <span className="font-gothic text-[10px] uppercase tracking-wider text-[#87867f] py-0.5">
                  +{post.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Creator Attribution Row */}
        <div className="pt-4 border-t border-[#cccbc8]/40 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            {post.creator?.avatarUrl ? (
              <img
                src={post.creator.avatarUrl}
                alt={creatorName}
                className="h-8 w-8 rounded-full object-cover shrink-0 border border-[#cccbc8]/60"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-[#141413] text-[#faf9f5] flex items-center justify-center font-gothic text-xs font-bold uppercase shrink-0">
                {post.creator?.firstName?.[0] || 'A'}
              </div>
            )}

            <div className="min-w-0">
              <p className="font-gothic text-xs font-bold uppercase tracking-wider text-[#141413] truncate leading-tight">
                {creatorName}
              </p>
              <Link
                to={`/u/${creatorUsername}`}
                onClick={(e) => e.stopPropagation()}
                className="font-serif text-xs text-[#87867f] hover:text-[#d97757] hover:underline truncate block leading-tight mt-0.5"
              >
                @{creatorUsername}
              </Link>
            </div>
          </div>

          {/* Publication Date */}
          <time className="font-gothic text-[11px] uppercase tracking-wider text-[#87867f] shrink-0">
            {formatDate(post.publishedAt || post.createdAt)}
          </time>
        </div>
      </div>
    </article>
  );
};
