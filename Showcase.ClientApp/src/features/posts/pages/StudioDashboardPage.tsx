import { Layers } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiClient } from "@shared/api/apiClient.ts";
import { Button } from "@shared/components/Button.tsx";
import { EmptyState } from "@shared/components/EmptyState.tsx";
import { ErrorBanner } from "@shared/components/ErrorBanner.tsx";
import { Skeleton } from "@shared/components/Skeleton.tsx";
import { VisitorGuard } from "@shared/components/VisitorGuard.tsx";
import { useAuth } from "@shared/context/index.ts";
import { PostStatus, type PostSummaryResponse } from "@shared/types/index.ts";
import {
  StudioDeleteModal,
  StudioFilterBar,
  StudioPostCard,
  type StudioSortOption,
  type StudioTabFilter,
} from "../components/index.ts";
import { usePostActions } from "../hooks/index.ts";

function filterAndSortStudioPosts(
  posts: PostSummaryResponse[],
  activeTab: StudioTabFilter,
  searchQuery: string,
  sortBy: StudioSortOption
): PostSummaryResponse[] {
  let result = posts.filter((post) => {
    const statusNum = Number(post.status);
    if (activeTab === "published") return statusNum === PostStatus.Published;
    if (activeTab === "drafts") {
      return statusNum === PostStatus.Draft || statusNum === PostStatus.Unpublished;
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
  const { activePersona, switchPersona, currentUser } = useAuth();

  const [posts, setPosts] = useState<PostSummaryResponse[]>([]);
  const [activeTab, setActiveTab] = useState<StudioTabFilter>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<StudioSortOption>("newest");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const {
    actionInProgressId,
    postToDelete,
    setPostToDelete,
    isDeleting,
    handleTogglePublish,
    handleConfirmDelete,
  } = usePostActions({ posts, setPosts });

  const loadPosts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.getMyPosts("all", 1, 100);
      setPosts(response.items);
    } catch (err) {
      console.error("Failed to load studio posts:", err);
      setError("Unable to load exhibition plates. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isCancelled = false;
    void Promise.resolve().then(async () => {
      if (isCancelled) return;
      await loadPosts();
    });
    return () => {
      isCancelled = true;
    };
  }, [loadPosts]);

  const filteredAndSortedPosts = useMemo(
    () => filterAndSortStudioPosts(posts, activeTab, searchQuery, sortBy),
    [posts, activeTab, searchQuery, sortBy]
  );

  const counts = useMemo(() => {
    const total = posts.length;
    const published = posts.filter((p) => Number(p.status) === PostStatus.Published).length;
    const drafts = posts.filter(
      (p) => Number(p.status) === PostStatus.Draft || Number(p.status) === PostStatus.Unpublished
    ).length;
    return { total, published, drafts };
  }, [posts]);

  if (activePersona === "visitor") {
    return (
      <VisitorGuard
        eyebrow="Studio Access \u2022 Authentication Notice"
        title="Creator Mode Required"
        description="The Creator Studio is reserved for cataloging, uploading, and publishing exhibition works. Switch to the Creator persona in the sidebar to access your workshop."
        onSwitchPersona={() => switchPersona("creator")}
        secondaryAction={
          currentUser ? (
            <Link to={`/u/${currentUser.username}`}>
              <Button variant="outline" size="md">
                View My Portfolio
              </Button>
            </Link>
          ) : null
        }
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f0eee6] pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        <StudioFilterBar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          counts={counts}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        {error && (
          <ErrorBanner
            className="mt-6"
            message={error}
            onRetry={loadPosts}
          />
        )}

        {isLoading && (
          <div className="mt-6 space-y-4">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-[#faf9f5] border border-[#cccbc8] rounded-[24px] p-6 flex flex-col md:flex-row items-center gap-6 shadow-none"
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
            title={searchQuery ? "No Matching Works Found" : "No Exhibition Works"}
            description={
              searchQuery
                ? `No exhibition plates matched your search query "${searchQuery}".`
                : activeTab === "published"
                  ? "You do not have any published works yet. Publish a draft to exhibit it in the gallery."
                  : activeTab === "drafts"
                    ? "Your draft archive is currently empty. Start drafting a new portfolio plate."
                    : "No works found in your creator portfolio. Begin creating your first exhibition plate now."
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
