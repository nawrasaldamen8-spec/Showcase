import { ArrowDown, RefreshCw, SearchX } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { apiClient } from "../../../shared/api/apiClient.ts";
import { Button } from "../../../shared/components/Button.tsx";
import { Skeleton } from "../../../shared/components/Skeleton.tsx";
import type { ExplorePostResponse } from "../../../shared/types/index.ts";
import { PostCard, type TileSpanType } from "../components/PostCard.tsx";

const PAGE_SIZE = 10;

/**
 * Editorial Bento Pattern Interleaving:
 * Combines Hero (2x2), Tall portrait (1x2), Wide landscape (2x1), and Classic square (1x1).
 * Coupled with CSS Grid `grid-flow-dense`, smaller items seamlessly pack into any open slots.
 */
const BENTO_PATTERN: TileSpanType[] = [
  "hero", // 0: 2x2 Feature hero
  "square", // 1: 1x1
  "square", // 2: 1x1
  "tall", // 3: 1x2 Vertical portrait
  "square", // 4: 1x1
  "wide", // 5: 2x1 Panoramic landscape
  "square", // 6: 1x1
  "square", // 7: 1x1
  "tall", // 8: 1x2 Vertical portrait
  "square", // 9: 1x1
  "hero", // 10: 2x2 Feature hero
  "square", // 11: 1x1
  "wide", // 12: 2x1 Panoramic landscape
  "square", // 13: 1x1
  "square", // 14: 1x1
  "tall", // 15: 1x2 Vertical portrait
  "square", // 16: 1x1
  "square", // 17: 1x1
  "wide", // 18: 2x1 Panoramic landscape
  "square", // 19: 1x1
];

const getSpanType = (index: number): TileSpanType => {
  return BENTO_PATTERN[index % BENTO_PATTERN.length] ?? "square";
};

const SKELETON_SPAN_CLASSES: Record<TileSpanType, string> = {
  square: "col-span-1 row-span-1",
  tall: "col-span-1 row-span-2",
  wide: "col-span-2 row-span-1",
  hero: "col-span-2 row-span-2",
};

export const ExplorePage: React.FC = () => {
  const [posts, setPosts] = useState<ExplorePostResponse[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial posts feed
  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.getExplorePosts(undefined, 1, PAGE_SIZE);

      setPosts(response.items);
      setTotalCount(response.totalCount);
      setPageNumber(1);
      setHasNextPage(response.hasNextPage);
    } catch (err) {
      console.error("Failed to load explore feed:", err);
      setError("Unable to load exhibition plates. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isCancelled = false;
    void Promise.resolve().then(async () => {
      if (isCancelled) return;
      await fetchPosts();
    });
    return () => {
      isCancelled = true;
    };
  }, [fetchPosts]);

  // Load more posts for pagination
  const handleLoadMore = async () => {
    if (isLoadingMore || !hasNextPage) return;

    setIsLoadingMore(true);
    const nextPage = pageNumber + 1;
    try {
      const response = await apiClient.getExplorePosts(undefined, nextPage, PAGE_SIZE);

      setPosts((prev) => [...prev, ...response.items]);
      setPageNumber(nextPage);
      setHasNextPage(response.hasNextPage);
    } catch (err) {
      console.error("Failed to load more posts:", err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6">
      {/* Main Content Area - Dynamic Asymmetric Bento Grid */}
      <section aria-label="Curated Exhibition Works">
        {/* Error State */}
        {error && (
          <div className="bg-[#faf9f5] border border-[#d97757]/40 rounded-[24px] p-8 text-center max-w-lg mx-auto my-12">
            <p className="font-serif text-lg text-[#141413]">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchPosts}
              leftIcon={<RefreshCw className="h-4 w-4" />}
              className="mt-4"
            >
              Retry
            </Button>
          </div>
        )}

        {/* Loading Skeletons on Initial Mount */}
        {isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 auto-rows-[170px] sm:auto-rows-[230px] lg:auto-rows-[280px] gap-1.5 sm:gap-2.5 lg:gap-3.5 grid-flow-dense">
            {Array.from({ length: 10 }).map((_, idx) => {
              const spanType = getSpanType(idx);
              return (
                <div
                  key={idx}
                  className={`bg-[#e6e3da] w-full h-full overflow-hidden ${SKELETON_SPAN_CLASSES[spanType]}`}
                >
                  <Skeleton variant="rectangular" className="w-full h-full" />
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State when no results found */}
        {!isLoading && !error && posts.length === 0 && (
          <div className="bg-[#faf9f5] rounded-[24px] border border-[#cccbc8]/60 p-12 sm:p-16 text-center max-w-xl mx-auto my-12">
            <div className="inline-flex items-center justify-center p-4 rounded-full bg-[#f0eee6] text-[#87867f] mb-4">
              <SearchX className="h-8 w-8 stroke-[1.5]" />
            </div>
            <h3 className="font-gothic text-2xl font-bold uppercase tracking-tight text-[#141413]">
              No Exhibition Plates Found
            </h3>
            <p className="font-serif text-[17px] text-[#141413]/75 mt-3 leading-relaxed">
              There are currently no published works cataloged in the exhibition.
            </p>
          </div>
        )}

        {/* Dynamic Asymmetric Bento Feed */}
        {!isLoading && !error && posts.length > 0 && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 auto-rows-[170px] sm:auto-rows-[230px] lg:auto-rows-[280px] gap-1.5 sm:gap-2.5 lg:gap-3.5 grid-flow-dense">
              {posts.map((post, index) => (
                <PostCard key={post.id} post={post} spanType={getSpanType(index)} />
              ))}
            </div>

            {/* Pagination / Load More */}
            <div className="mt-10 sm:mt-12 text-center">
              {hasNextPage ? (
                <div className="flex flex-col items-center gap-3">
                  <Button
                    variant="slate"
                    size="lg"
                    onClick={handleLoadMore}
                    isLoading={isLoadingMore}
                    rightIcon={!isLoadingMore ? <ArrowDown className="h-4 w-4" /> : undefined}
                    className="px-10"
                  >
                    Load More Plates
                  </Button>
                  <p className="font-gothic text-[11px] uppercase tracking-wider text-[#87867f]">
                    Showing {posts.length} of {totalCount} works
                  </p>
                </div>
              ) : (
                <div className="py-6 border-t border-[#cccbc8]/50 max-w-sm mx-auto">
                  <p className="font-serif text-sm italic text-[#87867f]">
                    You have reached the end of the curated exhibition.
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </section>
    </div>
  );
};
