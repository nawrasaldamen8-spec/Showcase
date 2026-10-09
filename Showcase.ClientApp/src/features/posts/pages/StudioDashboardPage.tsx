import { Layers } from "lucide-react";
import React, { useMemo, useState } from "react";
import { extractApiErrorMessage } from "@shared/api/index.ts";
import { EmptyState } from "@shared/components/EmptyState.tsx";
import { ErrorBanner } from "@shared/components/ErrorBanner.tsx";
import { Skeleton } from "@shared/components/Skeleton.tsx";
import type { PostSummaryResponse } from "@shared/types/index.ts";
import {
  StudioDeleteModal,
  StudioFilterBar,
  StudioPostCard,
  type StudioSortOption,
  type StudioTabFilter,
} from "../components/index.ts";
import { usePostActions } from "../hooks/index.ts";
import { useMyPostsQuery } from "../hooks/usePostQueries.ts";
import { isPostDraft, isPostPublished } from "../utils.ts";

function filterAndSortStudioPosts(
  posts: PostSummaryResponse[],
  activeTab: StudioTabFilter,
  searchQuery: string,
  sortBy: StudioSortOption
): PostSummaryResponse[] {
  let result = posts.filter((post) => {
    if (activeTab === "published") return isPostPublished(post.status);
    if (activeTab === "drafts") {
      return isPostDraft(post.status);
    }
    return true;
  });

  if (searchQuery.trim()) {
    const q = searchQuery.trim().toLowerCase();
    result = result.filter((post) => {
      const titleMatch = post.title.toLowerCase().includes(q);
      const descMatch = post.description?.toLowerCase().includes(q) ?? false;
      return titleMatch || descMatch;
    });
  }

  return [...result].sort((a, b) => {
    if (sortBy === "oldest") {
      const dateA = new Date(a.publishedAt || a.createdAt).getTime();
      const dateB = new Date(b.publishedAt || b.createdAt).getTime();
      return dateA - dateB;
    }
    if (sortBy === "title") {
      return a.title.localeCompare(b.title);
    }
    const dateA = new Date(a.publishedAt || a.createdAt).getTime();
    const dateB = new Date(b.publishedAt || b.createdAt).getTime();
    return dateB - dateA;
  });
}

export const StudioDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<StudioTabFilter>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<StudioSortOption>("newest");

  const {
    data: postsData,
    isLoading,
    isError,
    error,
    refetch,
  } = useMyPostsQuery({ status: "all", pageNumber: 1, pageSize: 50 });

  const posts = postsData?.items ?? [];

  const {
    actionInProgressId,
    postToDelete,
    setPostToDelete,
    isDeleting,
    handleTogglePublish,
    handleConfirmDelete,
  } = usePostActions();

  const errorMessage = isError
    ? extractApiErrorMessage(error, "Unable to load projects. Please try again.")
    : null;

  const filteredAndSortedPosts = useMemo(
    () => filterAndSortStudioPosts(posts, activeTab, searchQuery, sortBy),
    [posts, activeTab, searchQuery, sortBy]
  );

  const counts = useMemo(() => {
    const total = posts.length;
    const published = posts.filter((p) => isPostPublished(p.status)).length;
    const drafts = posts.filter((p) => isPostDraft(p.status)).length;
    return { total, published, drafts };
  }, [posts]);



  return (
    <div className="min-h-screen bg-ivory-medium pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        {/* Studio Editorial Header */}
        <header className="mb-6 sm:mb-8 border-b border-stone/60 pb-6">
          <h1 className="font-gothic text-2xl sm:text-4xl font-extrabold uppercase tracking-tight text-slate-dark">
            Project Studio
          </h1>
          <p className="font-serif text-sm sm:text-base text-slate-dark/70 mt-1 max-w-xl">
            Curate and publish your spatial monographs and built works.
          </p>
        </header>

        <StudioFilterBar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          counts={counts}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        {errorMessage && (
          <ErrorBanner
            className="mt-6"
            message={errorMessage}
            onRetry={() => {
              void refetch();
            }}
          />
        )}

        {isLoading && (
          <div className="mt-6 space-y-4">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-ivory-light border border-stone rounded-card p-6 flex flex-col md:flex-row items-center gap-6 shadow-none"
              >
                <Skeleton className="w-full md:w-44 h-32 rounded-xl shrink-0" />
                <div className="flex-1 w-full space-y-3">
                  <Skeleton className="h-6 w-1/3" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-9 w-20 rounded-full" />
                  <Skeleton className="h-9 w-20 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && filteredAndSortedPosts.length === 0 && (
          <EmptyState
            icon={Layers}
            title={searchQuery ? "No Matching Projects Found" : "No Projects Yet"}
            description={
              searchQuery
                ? `No projects matched your search query "${searchQuery}".`
                : activeTab === "published"
                  ? "You haven't published any projects yet. Publish a draft to make it visible on your profile."
                  : activeTab === "drafts"
                    ? "You don't have any drafts. Create a new project to get started."
                    : "No projects found. Create your first project now."
            }
            actionLabel={searchQuery ? "Clear Search" : undefined}
            actionVariant="outline"
            onAction={searchQuery ? () => setSearchQuery("") : undefined}
            className="mt-10 max-w-2xl mx-auto"
          />
        )}

        {!isLoading && filteredAndSortedPosts.length > 0 && (
          <div className="mt-6 space-y-4">
            {filteredAndSortedPosts.map((post) => (
              <StudioPostCard
                key={post.id}
                post={post}
                isActionRunning={actionInProgressId === post.id}
                onTogglePublish={handleTogglePublish}
                onDeleteClick={setPostToDelete}
              />
            ))}
          </div>
        )}
      </div>

      <StudioDeleteModal
        post={postToDelete}
        isDeleting={isDeleting}
        onClose={() => setPostToDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};
