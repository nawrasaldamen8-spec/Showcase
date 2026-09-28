import React from 'react';
import { PostStatus, type PostStatus as PostStatusType } from '@shared/types/index.ts';

export interface PostStatusBadgeProps {
  status: PostStatusType | number | string;
  size?: 'sm' | 'md';
  showDot?: boolean;
  className?: string;
}

/**
 * Normalizes input status to standard canonical representation.
 */
function normalizeStatus(status: PostStatusType | number | string): {
  key: 'draft' | 'published' | 'unpublished';
  label: string;
} {
  if (typeof status === 'number') {
    switch (status) {
      case PostStatus.Published:
        return { key: 'published', label: 'Published' };
      case PostStatus.Unpublished:
        return { key: 'unpublished', label: 'Unpublished' };
      case PostStatus.Draft:
      default:
        return { key: 'draft', label: 'Draft' };
    }
  }

  const normalized = String(status).trim().toLowerCase();
  if (normalized === 'published' || normalized === '1') {
    return { key: 'published', label: 'Published' };
  }
  if (normalized === 'unpublished' || normalized === '2') {
    return { key: 'unpublished', label: 'Unpublished' };
  }
  return { key: 'draft', label: 'Draft' };
}

// Warm Gallery palette mapping
const BADGE_STYLES: Record<
  'draft' | 'published' | 'unpublished',
  { container: string; dot: string }
> = {
  draft: {
    container: 'bg-amber/15 text-slate-dark border border-amber/40',
    dot: 'bg-amber',
  },
  published: {
    container: 'bg-clay text-ivory-light border border-transparent',
    dot: 'bg-ivory-light',
  },
  unpublished: {
    container: 'bg-stone/30 text-cloud-dark border border-stone',
    dot: 'bg-cloud-dark',
  },
};

const SIZE_CLASSES = {
  sm: 'px-2.5 py-0.5 text-[10px] gap-1.5',
  md: 'px-3 py-1 text-[11px] gap-2',
};

/**
 * Warm Gallery Post Status Badge
 * - Amber for Draft
 * - Clay for Published
 * - Stone for Unpublished
 */
export const PostStatusBadge: React.FC<PostStatusBadgeProps> = ({
  status,
  size = 'md',
  showDot = true,
  className = '',
}) => {
  const { key, label } = normalizeStatus(status);
  const currentStyle = BADGE_STYLES[key];

  return (
    <span
      className={`inline-flex items-center justify-center font-gothic font-semibold uppercase tracking-[0.12em] rounded-full select-none leading-none transition-colors ${SIZE_CLASSES[size]} ${currentStyle.container} ${className}`.trim()}
      role="status"
      aria-label={`Status: ${label}`}
    >
      {showDot && (
        <span
          className={`h-1.5 w-1.5 rounded-full shrink-0 ${currentStyle.dot}`}
          aria-hidden="true"
        />
      )}
      <span>{label}</span>
    </span>
  );
};
