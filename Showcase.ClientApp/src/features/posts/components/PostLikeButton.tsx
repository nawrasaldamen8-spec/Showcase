import { Heart } from "lucide-react";
import React, { useState } from "react";
import { apiClient } from "@shared/api/apiClient.ts";

export interface PostLikeButtonProps {
  postId: string;
  initialLiked?: boolean;
  initialCount?: number;
  size?: "sm" | "md" | "lg";
  variant?: "pill" | "subtle" | "floating";
  className?: string;
  onLikeChange?: (isLiked: boolean, count: number) => void;
}

export const PostLikeButton: React.FC<PostLikeButtonProps> = ({
  postId,
  initialLiked = false,
  initialCount = 0,
  size = "md",
  variant = "pill",
  className = "",
  onLikeChange,
}) => {
  const [overrideState, setOverrideState] = useState<{ isLiked: boolean; count: number } | null>(null);
  const [prevProps, setPrevProps] = useState({ initialLiked, initialCount, postId });
  const [isPending, setIsPending] = useState<boolean>(false);
  const [isPopping, setIsPopping] = useState<boolean>(false);

  // Synchronize state during render when props change
  if (
    prevProps.initialLiked !== initialLiked ||
    prevProps.initialCount !== initialCount ||
    prevProps.postId !== postId
  ) {
    setPrevProps({ initialLiked, initialCount, postId });
    setOverrideState(null);
  }

  const isLiked = overrideState !== null ? overrideState.isLiked : initialLiked;
  const count = overrideState !== null ? overrideState.count : initialCount;

  const handleToggleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isPending) return;

    // Optimistic calculation
    const currentLiked = isLiked;
    const currentCount = count;
    const nextLiked = !currentLiked;
    const nextCount = nextLiked ? currentCount + 1 : Math.max(0, currentCount - 1);

    setOverrideState({ isLiked: nextLiked, count: nextCount });
    setIsPopping(true);
    setTimeout(() => setIsPopping(false), 300);
    onLikeChange?.(nextLiked, nextCount);

    setIsPending(true);
    try {
      const res = await apiClient.toggleLikePost(postId);
      setOverrideState({ isLiked: res.isLiked, count: res.likeCount });
      onLikeChange?.(res.isLiked, res.likeCount);
    } catch {
      // Rollback on failure
      setOverrideState({ isLiked: currentLiked, count: currentCount });
      onLikeChange?.(currentLiked, currentCount);
    } finally {
      setIsPending(false);
    }
  };

  const formatCount = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  const sizeClasses = {
    sm: "px-2.5 py-1 text-xs gap-1.5",
    md: "px-3.5 py-1.5 text-xs sm:text-sm gap-2",
    lg: "px-4 py-2 text-sm sm:text-base gap-2.5",
  }[size];

  const iconSizes = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  }[size];

  const variantClasses = {
    pill: isLiked
      ? "bg-[#d97757]/10 text-[#d97757] border border-[#d97757]/30 hover:bg-[#d97757]/20"
      : "bg-[#faf9f5] text-[#141413] border border-[#cccbc8] hover:border-[#141413] hover:bg-[#f0eee6]",
    subtle: isLiked
      ? "text-[#d97757] hover:bg-[#d97757]/10"
      : "text-[#87867f] hover:text-[#141413] hover:bg-[#141413]/5",
    floating: isLiked
      ? "bg-[#141413]/85 text-[#d97757] backdrop-blur-md border border-[#d97757]/40"
      : "bg-[#141413]/75 text-[#faf9f5] backdrop-blur-md border border-white/10 hover:bg-[#141413]",
  }[variant];

  return (
    <button
      type="button"
      onClick={handleToggleLike}
      disabled={isPending}
      aria-label={isLiked ? "Unlike exhibition plate" : "Like exhibition plate"}
      aria-pressed={isLiked}
      className={`inline-flex items-center justify-center font-gothic font-semibold uppercase tracking-wider rounded-full transition-all duration-200 cursor-pointer select-none active:scale-95 ${sizeClasses} ${variantClasses} ${className}`}
    >
      <Heart
        className={`${iconSizes} transition-transform duration-300 ${
          isPopping ? "scale-130" : "scale-100"
        } ${isLiked ? "fill-[#d97757] text-[#d97757]" : ""}`}
      />
      <span className="tabular-nums">{formatCount(count)}</span>
    </button>
  );
};
