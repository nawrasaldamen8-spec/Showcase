import { Heart } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient, queryKeys } from "@shared/api/index.ts";
import { useAuth } from "@shared/context/index.ts";

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
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const [isLiked, setIsLiked] = useState<boolean>(initialLiked);
  const [count, setCount] = useState<number>(initialCount);
  const [isPopping, setIsPopping] = useState<boolean>(false);

  const syncedLikedRef = useRef<boolean>(initialLiked);
  const currentLikedRef = useRef<boolean>(initialLiked);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const poppingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync initial props from server query
  useEffect(() => {
    setIsLiked(initialLiked);
    setCount(initialCount);
    syncedLikedRef.current = initialLiked;
    currentLikedRef.current = initialLiked;
  }, [initialLiked, initialCount]);

  // Clean up debounce and animation timers on unmount to prevent memory retention
  useEffect(() => {
    return () => {
      if (poppingTimerRef.current) {
        clearTimeout(poppingTimerRef.current);
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        if (syncedLikedRef.current !== currentLikedRef.current) {
          void apiClient.toggleLikePost(postId, currentLikedRef.current).catch(() => {});
        }
      }
    };
  }, [postId]);

  const commitLikeState = async (desired: boolean) => {
    if (syncedLikedRef.current === desired) return;
    try {
      const res = await apiClient.toggleLikePost(postId, desired);
      syncedLikedRef.current = res.isLiked;
      // Keep TanStack Query cache in sync
      queryClient.setQueriesData({ queryKey: queryKeys.posts.detail(postId) }, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          isLiked: res.isLiked,
          likeCount: res.likeCount,
        };
      });
    } catch (err: any) {
      console.error("Failed to commit like state:", err);
      setIsLiked(syncedLikedRef.current);
      currentLikedRef.current = syncedLikedRef.current;
      setCount(initialCount);
      if (err?.response?.status === 401) {
        toast.warning("Please sign in to like this project.");
      }
    }
  };

  // Commit on unmount / navigation if a debounce is pending
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      if (poppingTimerRef.current) {
        clearTimeout(poppingTimerRef.current);
        poppingTimerRef.current = null;
      }
      const target = currentLikedRef.current;
      if (syncedLikedRef.current !== target) {
        commitLikeState(target);
      }
    };
  }, [postId]);

  const handleToggleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.warning("Please sign in to like this project.");
      return;
    }

    // Optimistic local state update
    const nextLiked = !currentLikedRef.current;
    const nextCount = nextLiked ? count + 1 : Math.max(0, count - 1);

    setIsLiked(nextLiked);
    setCount(nextCount);
    currentLikedRef.current = nextLiked;
    setIsPopping(true);

    if (poppingTimerRef.current) {
      clearTimeout(poppingTimerRef.current);
    }
    poppingTimerRef.current = setTimeout(() => setIsPopping(false), 300);

    onLikeChange?.(nextLiked, nextCount);

    // Debounce network commit (400ms) to coalesce rapid toggles
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      debounceTimerRef.current = null;
      commitLikeState(currentLikedRef.current);
    }, 400);
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
