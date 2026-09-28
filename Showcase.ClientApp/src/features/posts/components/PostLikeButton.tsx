import { Heart } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
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

const sizeClasses: Record<"sm" | "md" | "lg", string> = {
  sm: "px-2.5 py-1 text-xs gap-1.5",
  md: "px-3.5 py-1.5 text-xs sm:text-sm gap-2",
  lg: "px-4 py-2 text-sm sm:text-base gap-2.5",
};

const iconSizes: Record<"sm" | "md" | "lg", string> = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

function formatCount(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
  return num.toString();
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
  const [isLiked, setIsLiked] = useState<boolean>(initialLiked);
  const [count, setCount] = useState<number>(initialCount);
  const [isPending, setIsPending] = useState<boolean>(false);
  const [isPopping, setIsPopping] = useState<boolean>(false);
  const poppingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (poppingTimer.current) {
        clearTimeout(poppingTimer.current);
      }
    };
  }, []);

  const handleToggleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isPending) return;

    // Optimistic calculation
    const currentLiked = isLiked;
    const currentCount = count;
    const nextLiked = !currentLiked;
    const nextCount = nextLiked ? currentCount + 1 : Math.max(0, currentCount - 1);

    setIsLiked(nextLiked);
    setCount(nextCount);
    setIsPopping(true);

    if (poppingTimer.current) {
      clearTimeout(poppingTimer.current);
    }
    poppingTimer.current = setTimeout(() => setIsPopping(false), 300);
    onLikeChange?.(nextLiked, nextCount);

    setIsPending(true);
    try {
      const res = await apiClient.toggleLikePost(postId);
      setIsLiked(res.isLiked);
      setCount(res.likeCount);
      onLikeChange?.(res.isLiked, res.likeCount);
    } catch {
      // Rollback on failure
      setIsLiked(currentLiked);
      setCount(currentCount);
      onLikeChange?.(currentLiked, currentCount);
    } finally {
      setIsPending(false);
    }
  };

  const variantClass = {
    pill: isLiked
      ? "bg-clay/10 text-clay border border-clay/30 hover:bg-clay/20"
      : "bg-ivory-light text-slate-dark border border-stone hover:border-slate-dark hover:bg-ivory-medium",
    subtle: isLiked
      ? "text-clay hover:bg-clay/10"
      : "text-cloud-dark hover:text-slate-dark hover:bg-slate-dark/5",
    floating: isLiked
      ? "bg-slate-dark/85 text-clay backdrop-blur-md border border-clay/40"
      : "bg-slate-dark/75 text-ivory-light backdrop-blur-md border border-white/10 hover:bg-slate-dark",
  }[variant];

  return (
    <button
      type="button"
      onClick={handleToggleLike}
      disabled={isPending}
      aria-label={isLiked ? "Unlike exhibition plate" : "Like exhibition plate"}
      aria-pressed={isLiked}
      className={`inline-flex items-center justify-center font-gothic font-semibold uppercase tracking-wider rounded-full transition-all duration-200 cursor-pointer select-none active:scale-95 ${sizeClasses[size]} ${variantClass} ${className}`}
    >
      <Heart
        className={`${iconSizes[size]} transition-transform duration-300 ${
          isPopping ? "scale-130" : "scale-100"
        } ${isLiked ? "fill-clay text-clay" : ""}`}
      />
      <span className="tabular-nums">{formatCount(count)}</span>
    </button>
  );
};
