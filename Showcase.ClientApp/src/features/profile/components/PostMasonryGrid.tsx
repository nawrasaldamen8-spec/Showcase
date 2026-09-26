import { ArrowDown, Layers } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@shared/components/Button.tsx";
import { EmptyState } from "@shared/components/EmptyState.tsx";
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
      <div className="columns-2 sm:columns-3 lg:columns-4 gap-3.5 sm:gap-4 lg:gap-5 [column-fill:_balance]">
        {posts.map((post) => (
          <div key={post.id} className="break-inside-avoid mb-3.5 sm:mb-4 lg:mb-5">
            <PostCard
              post={
                {
                  ...post,
                  creator: {
                    profileId: creator.id,
                    username: creator.username,
                    firstName: creator.firstName,
                    lastName: creator.lastName,
                    avatarUrl: creator.avatarUrl,
                  },
                } as ExplorePostResponse
              }
              aspectRatio="auto"
            />
          </div>
        ))}
      </div>

      {hasNextPage && (
        <div className="mt-10 sm:mt-12 text-center">
          <Button
            variant="slate"
            size="md"
            onClick={onLoadMore}
            isLoading={isLoadingMore}
            rightIcon={!isLoadingMore ? <ArrowDown className="h-4 w-4" /> : undefined}
            className="px-8"
          >
            Load More Projects
          </Button>
        </div>
      )}
    </>
  );
};
