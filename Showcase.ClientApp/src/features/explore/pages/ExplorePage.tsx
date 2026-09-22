import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SearchX, ArrowDown, RefreshCw } from 'lucide-react';
import type { ExplorePostResponse } from '../../../shared/types/index.ts';
import { apiClient } from '../../../shared/api/apiClient.ts';
import { Button } from '../../../shared/components/Button.tsx';
import { Skeleton } from '../../../shared/components/Skeleton.tsx';
import { ExploreHeader } from '../components/ExploreHeader.tsx';
import { PostCard } from '../components/PostCard.tsx';

const PAGE_SIZE = 6;

export const ExplorePage: React.FC = () => {
  const [posts, setPosts] = useState<ExplorePostResponse[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Debounce search input by 250ms
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(query);
    }, 250);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setDebouncedSearch('');
    setSelectedCategory('All');
  };

  // Fetch initial or refreshed posts when search or category changes
  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.getExplorePosts(
        debouncedSearch.trim() || undefined,
        1,
        PAGE_SIZE,
        selectedCategory !== 'All' ? selectedCategory : undefined
      );

      setPosts(response.items);
      setTotalCount(response.totalCount);
      setPageNumber(1);
      setHasNextPage(response.hasNextPage);
    } catch (err) {
      console.error('Failed to load explore feed:', err);
      setError('Unable to load exhibition plates. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, selectedCategory]);

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
      const response = await apiClient.getExplorePosts(
        debouncedSearch.trim() || undefined,
        nextPage,
        PAGE_SIZE,
        selectedCategory !== 'All' ? selectedCategory : undefined
      );

      setPosts((prev) => [...prev, ...response.items]);
      setPageNumber(nextPage);
      setHasNextPage(response.hasNextPage);
    } catch (err) {
      console.error('Failed to load more posts:', err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Editorial Header with Search & Category Filters */}
      <ExploreHeader
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
        totalCount={totalCount}
      />

      {/* Main Content Area */}
      <section className="mt-10 sm:mt-12" aria-label="Curated Exhibition Works">
        {/* Error State */}
        {error && (
          <div className="bg-[#faf9f5] border border-[#d97757]/40 rounded-[24px] p-8 text-center max-w-lg mx-auto">
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

        {/* Loading Skeletons on Initial Mount or Filter Change */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-[#faf9f5] rounded-[24px] border border-[#cccbc8]/50 overflow-hidden flex flex-col"
              >
                <Skeleton variant="rectangular" className="aspect-[4/3] w-full" />
                <div className="p-6 space-y-4">
                  <Skeleton variant="text" width="75%" height={24} />
                  <Skeleton variant="text" width="90%" height={16} />
                  <Skeleton variant="text" width="60%" height={16} />
                  <div className="pt-4 border-t border-[#cccbc8]/40 flex items-center gap-3">
                    <Skeleton variant="circular" width={32} height={32} />
                    <div className="space-y-1.5 flex-1">
                      <Skeleton variant="text" width="50%" height={12} />
                      <Skeleton variant="text" width="30%" height={10} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State when no results found */}
        {!isLoading && !error && posts.length === 0 && (
          <div className="bg-[#faf9f5] rounded-[24px] border border-[#cccbc8]/60 p-12 sm:p-16 text-center max-w-xl mx-auto my-8">
            <div className="inline-flex items-center justify-center p-4 rounded-full bg-[#f0eee6] text-[#87867f] mb-4">
              <SearchX className="h-8 w-8 stroke-[1.5]" />
            </div>
            <h3 className="font-gothic text-2xl font-bold uppercase tracking-tight text-[#141413]">
              No Exhibition Plates Found
            </h3>
            <p className="font-serif text-[17px] text-[#141413]/75 mt-3 leading-relaxed">
              {debouncedSearch
                ? `No published works matched your search for "${debouncedSearch}". Try exploring different terms or clearing your search.`
                : `There are currently no published works cataloged under category "${selectedCategory}".`}
            </p>
            <div className="mt-6">
              <Button
                variant="slate"
                size="md"
                onClick={handleResetFilters}
              >
                Reset All Filters
              </Button>
            </div>
          </div>
        )}

        {/* Responsive Editorial Grid: 1 col mobile, 2 col tablet, 3 col desktop */}
        {!isLoading && !error && posts.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>

            {/* Pagination / Load More Pill Button */}
            <div className="mt-14 sm:mt-16 text-center">
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
