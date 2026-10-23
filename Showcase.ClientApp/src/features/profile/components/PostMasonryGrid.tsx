import { Layers, Loader2 } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@shared/components/Button.tsx";
import { EmptyState } from "@shared/components/EmptyState.tsx";
import { useInfiniteScroll } from "@shared/hooks/useInfiniteScroll.ts";
import type { ExplorePostResponse, PostSummaryResponse, PublicProfileResponse } from "@shared/types/index.ts";
import { PostCard } from "@features/posts/components/index.ts";

export interface PostMasonryGridProps {
  posts: PostSummaryResponse[];
  creator: PublicProfileResponse;
  isOwnProfile: boolean;
  hasNextPage: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
}

export const PostMasonryGrid: React.FC<PostMasonryGridProps> = ({
  posts,
  creator,
  isOwnProfile,
  hasNextPage,
  isLoadingMore,
  onLoadMore,
}) => {
  const sentinelRef = useInfiniteScroll({
    hasNextPage,
    isFetchingNextPage: isLoadingMore,
    fetchNextPage: onLoadMore,
    rootMargin: "350px",
  });

  if (posts.length === 0) {
    return (
      <EmptyState
        icon={Layers}
        title="No Projects Yet"
        description="No published projects yet."
        className="max-w-lg mx-auto my-8"
      >
        <Link to={isOwnProfile ? "/studio" : "/feed"}>
          <Button variant="slate" size="sm">
            {isOwnProfile ? "Go to Studio" : "Explore Projects"}
          </Button>
        </Link>
      </EmptyState>
    );
  }

  return (
    <>
      {/* Masonry layout using Tailwind columns */}
      <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
        {posts.map((post) => (
          <div key={post.id} className="break-inside-avoid">
            <PostCard
              post={
                {
                  ...post,
                  creator: {
                    profileId: creator.id,
                    username: creator.username,
                    name: creator.name,
                    avatarUrl: creator.avatarUrl,
                  },
                } as ExplorePostResponse
              }
              aspectRatio="auto"
              className="rounded-lg sm:rounded-xl overflow-hidden break-inside-avoid border border-stone/50 hover:border-slate-dark/40 shadow-xs hover:shadow-md transition-[border-color,box-shadow] duration-300 ease-out"
            />
          </div>
        ))}
      </div>

      {/* Sentinel element for infinite scrolling & bottom loading shimmer */}
      <div ref={sentinelRef} className="py-6 flex justify-center items-center">
        {isLoadingMore && (
          <div className="flex items-center gap-2 text-cloud-dark font-serif text-xs">
            <Loader2 className="w-4 h-4 animate-spin text-clay" />
            <span>Loading more projects...</span>
          </div>
        )}
      </div>
    </>
  );
};

