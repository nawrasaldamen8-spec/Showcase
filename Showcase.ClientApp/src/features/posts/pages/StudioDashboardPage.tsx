import { Layers, Plus } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiClient, extractApiErrorMessage } from "@shared/api/index.ts";
import { EmptyState } from "@shared/components/EmptyState.tsx";
import { ErrorBanner } from "@shared/components/ErrorBanner.tsx";
import { Skeleton } from "@shared/components/Skeleton.tsx";
import { type PostSummaryResponse } from "@shared/types/index.ts";
import {
  StudioDeleteModal,
  StudioFilterBar,
  StudioPostCard,
  type StudioSortOption,
  type StudioTabFilter,
} from "../components/index.ts";
import { usePostActions } from "../hooks/index.ts";
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
      const response = await apiClient.getMyPosts("all", 1, 50);
      setPosts(response.items);
    } catch (err) {
      console.error("Failed to load studio posts:", err);
      setError(extractApiErrorMessage(err, "Unable to load projects. Please try again."));
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
    const published = posts.filter((p) => isPostPublished(p.status)).length;
    const drafts = posts.filter((p) => isPostDraft(p.status)).length;
    return { total, published, drafts };
  }, [posts]);



  return (
    <div className="min-h-screen bg-ivory-medium pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        {/* Studio Editorial Header & Pulse Metrics */}
        <header className="mb-6 sm:mb-8 border-b border-stone/60 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <div>
              <span className="font-gothic text-[11px] font-bold uppercase tracking-[0.2em] text-clay block mb-1">
                Portfolio Curation
              </span>
              <h1 className="font-gothic text-2xl sm:text-4xl font-extrabold uppercase tracking-tight text-slate-dark">
                Project Studio
              </h1>
              <p className="font-serif text-sm sm:text-base text-slate-dark/70 mt-1 max-w-xl">
                Curate and publish your spatial monographs and built works.
              </p>
            </div>
            <Link
              to="/posts/new"
              className="hidden sm:inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-clay hover:bg-clay/90 text-ivory-light font-gothic text-xs font-bold uppercase tracking-wider transition-all self-start sm:self-auto cursor-pointer text-decoration-none min-h-[46px]"
            >
              <Plus className="w-4 h-4" />
              <span>New Exhibition</span>
            </Link>
          </div>

          {/* Quick Metrics Bar (Responsive: Grid 3 cols) */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            <div className="bg-ivory-light border border-stone/60 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center sm:text-left">
              <span className="font-gothic text-[10px] sm:text-xs font-bold uppercase tracking-wider text-cloud-dark block">
                Total Works
              </span>
              <span className="font-gothic text-lg sm:text-2xl font-extrabold text-slate-dark tabular-nums mt-0.5 block">
                {counts.total}
              </span>
            </div>
            <div className="bg-ivory-light border border-stone/60 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center sm:text-left">
              <span className="font-gothic text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#2e7d32] block">
                Published
              </span>
              <span className="font-gothic text-lg sm:text-2xl font-extrabold text-[#2e7d32] tabular-nums mt-0.5 block">
                {counts.published}
              </span>
            </div>
            <div className="bg-ivory-light border border-stone/60 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center sm:text-left">
              <span className="font-gothic text-[10px] sm:text-xs font-bold uppercase tracking-wider text-cloud-dark block">
                Drafts
              </span>
              <span className="font-gothic text-lg sm:text-2xl font-extrabold text-slate-dark/80 tabular-nums mt-0.5 block">
                {counts.drafts}
              </span>
            </div>
          </div>
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
