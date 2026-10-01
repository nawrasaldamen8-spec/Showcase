import { useEffect, useRef } from "react";

export interface UseInfiniteScrollOptions {
  hasNextPage?: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void | Promise<unknown>;
  rootMargin?: string;
  threshold?: number;
  enabled?: boolean;
}

/**
 * Modern, high-performance IntersectionObserver hook for seamless infinite scrolling.
 * Automatically fetches the next page when the sentinel element nears the viewport.
 */
export function useInfiniteScroll({
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  rootMargin = "300px",
  threshold = 0.1,
  enabled = true,
}: UseInfiniteScrollOptions) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!enabled || !hasNextPage || isFetchingNextPage) return;

    const element = sentinelRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        root: null,
        rootMargin,
        threshold,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, rootMargin, threshold, enabled]);

  return sentinelRef;
}
