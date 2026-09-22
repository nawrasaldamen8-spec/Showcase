import {
  Archive,
  ExternalLink,
  Globe,
  Image as ImageIcon,
  Layers,
  Pencil,
  Plus,
  Trash2,
  UserCheck,
} from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiClient } from "../../../shared/api/apiClient.ts";
import { Button } from "../../../shared/components/Button.tsx";
import { Modal } from "../../../shared/components/Modal.tsx";
import { Skeleton } from "../../../shared/components/Skeleton.tsx";
import { useAuth, useToast } from "../../../shared/context/index.ts";
import { PostStatus, type PostSummaryResponse } from "../../../shared/types/index.ts";
import { PostStatusBadge } from "../components/PostStatusBadge.tsx";

type TabFilter = "all" | "published" | "drafts";

function formatDate(isoString?: string | null): string {
  if (!isoString) return "Undated";
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  } catch {
    return "Undated";
  }
}

export const StudioDashboardPage: React.FC = () => {
  const { currentUser, activePersona, switchPersona } = useAuth();
  const { showToast } = useToast();

  const [posts, setPosts] = useState<PostSummaryResponse[]>([]);
  const [activeTab, setActiveTab] = useState<TabFilter>("all");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Quick Action Pending States
  const [actionInProgressId, setActionInProgressId] = useState<string | null>(null);

  // Delete Confirmation Modal State
  const [postToDelete, setPostToDelete] = useState<PostSummaryResponse | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const addToast = useCallback(
    (type: "success" | "error" | "warning", message: string) => {
      showToast(type, message);
    },
    [showToast],
  );

  // Load all posts for current creator
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

  // Derived filtered post lists
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const statusNum = Number(post.status);
      if (activeTab === "published") {
        return statusNum === PostStatus.Published;
      }
      if (activeTab === "drafts") {
        return statusNum === PostStatus.Draft || statusNum === PostStatus.Unpublished;
      }
      return true;
    });
  }, [posts, activeTab]);

  // Tab count metrics
  const counts = useMemo(() => {
    const total = posts.length;
    const published = posts.filter((p) => Number(p.status) === PostStatus.Published).length;
    const drafts = posts.filter(
      (p) => Number(p.status) === PostStatus.Draft || Number(p.status) === PostStatus.Unpublished,
    ).length;
    return { total, published, drafts };
  }, [posts]);

  // Quick Publish / Unpublish Toggle with Invariant Enforcement
  const handleTogglePublish = async (post: PostSummaryResponse) => {
    const isCurrentlyPublished = Number(post.status) === PostStatus.Published;

    if (isCurrentlyPublished) {
      // Unpublish
      setActionInProgressId(post.id);
      try {
        await apiClient.unpublishPost(post.id);
        setPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, status: PostStatus.Unpublished } : p)));
        addToast("success", `"${post.title}" moved to Unpublished.`);
      } catch (err) {
        console.error("Failed to unpublish post:", err);
        addToast("error", "Failed to unpublish post.");
      } finally {
        setActionInProgressId(null);
      }
    } else {
      // Publish: MANDATORY INVARIANT ENFORCEMENT
      // A post CANNOT be published without at least one uploaded image (>= 1)
      if (!post.imageCount || post.imageCount < 1) {
        addToast(
          "warning",
          'Publishing Invariant: A post must have at least one uploaded plate before publishing. Click "Edit" to add artwork.',
        );
        return;
      }

      setActionInProgressId(post.id);
      try {
        await apiClient.publishPost(post.id);
        const now = new Date().toISOString();
        setPosts((prev) =>
          prev.map((p) =>
            p.id === post.id ? { ...p, status: PostStatus.Published, publishedAt: p.publishedAt || now } : p,
          ),
        );
        addToast("success", `"${post.title}" is now published to the public gallery.`);
      } catch (err) {
        console.error("Failed to publish post:", err);
        addToast("error", "Failed to publish post. Ensure artwork is uploaded.");
      } finally {
        setActionInProgressId(null);
      }
    }
  };

  // Delete Execution
  const handleConfirmDelete = async () => {
    if (!postToDelete) return;
    setIsDeleting(true);
    try {
      await apiClient.deletePost(postToDelete.id);
      setPosts((prev) => prev.filter((p) => p.id !== postToDelete.id));
      addToast("success", `"${postToDelete.title}" permanently removed.`);
      setPostToDelete(null);
    } catch (err) {
      console.error("Failed to delete post:", err);
      addToast("error", "Failed to delete post.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Guard for Visitor persona
  if (activePersona === "visitor") {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="inline-flex items-center justify-center p-4 rounded-full bg-[#faf9f5] border border-[#cccbc8] text-[#87867f] mb-6">
          <UserCheck className="h-10 w-10 stroke-[1.5]" />
        </div>
        <span className="font-gothic text-xs font-bold uppercase tracking-[0.16em] text-[#87867f] block mb-2">
          Studio Access &bull; Authentication Notice
        </span>
        <h1 className="font-gothic text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-[#141413]">
          Creator Mode Required
        </h1>
        <p className="font-serif text-[18px] text-[#141413]/80 mt-4 leading-relaxed max-w-lg mx-auto">
          The Creator Studio is reserved for cataloging, uploading, and publishing exhibition works. Switch to the
          Creator persona in the navigation bar to access your workshop.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Button variant="clay" size="md" onClick={() => switchPersona("creator")}>
            Switch to Creator Persona
          </Button>
          <Link to="/explore">
            <Button variant="outline" size="md">
              Return to Explore
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const creatorDisplayName = currentUser
    ? `${currentUser.firstName} ${currentUser.lastName}`.trim() || currentUser.username
    : "Elena Rostova";

  return (
    <div className="min-h-screen bg-[#f0eee6] pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16">
        {/* Studio Editorial Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 border-b border-[#cccbc8]">
          <div className="space-y-3">
            <span className="font-gothic text-xs font-bold uppercase tracking-[0.16em] text-[#87867f]">
              Exhibition Atelier &bull; Management
            </span>
            <h1 className="font-gothic text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight uppercase text-[#141413]">
              Creator Studio
            </h1>
            <p className="font-serif text-lg sm:text-xl text-[#141413]/75 max-w-2xl leading-relaxed">
              Welcome back, <strong className="font-semibold text-[#141413]">{creatorDisplayName}</strong>. Review your
              published works, stage new visual series, and curate exhibition plates.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/posts/new">
              <Button variant="clay" size="lg" leftIcon={<Plus className="h-5 w-5 stroke-[2.2]" />}>
                New Post
              </Button>
            </Link>
          </div>
        </div>

        {/* Typographic Status Filter Tabs */}
        <div className="mt-8 flex items-center justify-between border-b border-[#cccbc8] overflow-x-auto no-scrollbar">
          <nav className="flex items-center gap-8" aria-label="Post status tabs">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`font-gothic text-[13px] font-semibold uppercase tracking-[0.10em] pb-3 transition-colors relative cursor-pointer ${
                activeTab === "all" ? "text-[#141413]" : "text-[#87867f] hover:text-[#141413]"
              }`}
            >
              All
              <span className="ml-2 text-xs font-normal opacity-75 font-serif">({counts.total})</span>
              {activeTab === "all" && <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#141413]" />}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("published")}
              className={`font-gothic text-[13px] font-semibold uppercase tracking-[0.10em] pb-3 transition-colors relative cursor-pointer ${
                activeTab === "published" ? "text-[#141413]" : "text-[#87867f] hover:text-[#141413]"
              }`}
            >
              Published
              <span className="ml-2 text-xs font-normal opacity-75 font-serif">({counts.published})</span>
              {activeTab === "published" && (
                <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#141413]" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("drafts")}
              className={`font-gothic text-[13px] font-semibold uppercase tracking-[0.10em] pb-3 transition-colors relative cursor-pointer ${
                activeTab === "drafts" ? "text-[#141413]" : "text-[#87867f] hover:text-[#141413]"
              }`}
            >
              Drafts
              <span className="ml-2 text-xs font-normal opacity-75 font-serif">({counts.drafts})</span>
              {activeTab === "drafts" && <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#141413]" />}
            </button>
          </nav>

          <span className="font-gothic text-xs uppercase tracking-wider text-[#87867f] hidden sm:block pb-3">
            Showing {filteredPosts.length} {filteredPosts.length === 1 ? "Work" : "Works"}
          </span>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            role="alert"
            className="mt-6 flex items-center justify-between p-4 rounded-xl bg-[#d97757]/10 border border-[#d97757]/30 text-[#d97757] font-serif text-sm"
          >
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={loadPosts}>
              Retry
            </Button>
          </div>
        )}

        {/* Loading Skeletons */}
        {isLoading && (
          <div className="mt-8 space-y-4">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-[#faf9f5] border border-[#cccbc8] rounded-[24px] p-6 flex flex-col md:flex-row items-center gap-6"
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

        {/* Empty State */}
        {!isLoading && filteredPosts.length === 0 && (
          <div className="mt-12 bg-[#faf9f5] border border-[#cccbc8] rounded-[24px] p-12 sm:p-16 text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center justify-center p-4 rounded-full bg-[#f0eee6] border border-[#cccbc8]/60 text-[#87867f] mb-4">
              <Layers className="h-8 w-8 stroke-[1.5]" />
            </div>
            <h3 className="font-gothic text-2xl font-bold uppercase tracking-tight text-[#141413]">
              No Exhibition Works Cataloged
            </h3>
            <p className="font-serif text-sm sm:text-base text-[#87867f] mt-2 mb-6 leading-relaxed">
              {activeTab === "published"
                ? "You do not have any published works yet. Publish a draft to exhibit it to the global community."
                : activeTab === "drafts"
                  ? "Your draft archive is currently empty. Start drafting a new portfolio plate."
                  : "No works found in your creator portfolio. Begin creating your first exhibition plate now."}
            </p>
            <Link to="/posts/new">
              <Button variant="clay" size="md" leftIcon={<Plus className="h-4 w-4" />}>
                Create New Post
              </Button>
            </Link>
          </div>
        )}

        {/* Post List / Cards */}
        {!isLoading && filteredPosts.length > 0 && (
          <div className="mt-8 space-y-4">
            {filteredPosts.map((post) => {
              const isPublished = Number(post.status) === PostStatus.Published;
              const hasImages = (post.imageCount || 0) > 0;
              const isActionRunning = actionInProgressId === post.id;

              return (
                <div
                  key={post.id}
                  className="bg-[#faf9f5] border border-[#cccbc8] rounded-[24px] p-5 sm:p-6 transition-all duration-200 hover:border-[#141413]/70 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                >
                  {/* Left: Thumbnail & Details */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 w-full md:w-auto flex-1">
                    {/* Thumbnail */}
                    <div className="relative w-full sm:w-40 sm:h-28 h-48 bg-[#f0eee6] rounded-xl overflow-hidden shrink-0 border border-[#cccbc8]/60">
                      {post.thumbnailUrl ? (
                        <img
                          src={post.thumbnailUrl}
                          alt={post.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src =
                              "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-[#87867f] gap-1 p-2">
                          <ImageIcon className="h-6 w-6 stroke-[1.5]" />
                          <span className="font-gothic text-[10px] uppercase tracking-wider">No plates</span>
                        </div>
                      )}

                      {/* Image count pill */}
                      <div className="absolute bottom-2 right-2 bg-[#141413]/85 text-[#faf9f5] font-gothic text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full backdrop-blur-xs select-none">
                        {post.imageCount} {post.imageCount === 1 ? "Plate" : "Plates"}
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <PostStatusBadge status={post.status} size="sm" />
                        <span className="font-serif text-xs text-[#87867f]">
                          {isPublished
                            ? `Published ${formatDate(post.publishedAt || post.createdAt)}`
                            : `Updated ${formatDate(post.createdAt)}`}
                        </span>
                      </div>

                      <h3 className="font-gothic text-xl sm:text-2xl font-bold tracking-tight text-[#141413]">
                        {post.title}
                      </h3>

                      <p className="font-serif text-sm text-[#141413]/70 line-clamp-2 leading-relaxed">
                        {post.description || "No description provided."}
                      </p>

                      {post.externalUrl && (
                        <div className="pt-1">
                          <a
                            href={post.externalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 font-gothic text-[11px] font-semibold uppercase tracking-wider text-[#d97757] hover:underline"
                          >
                            <span>External Project</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end pt-4 md:pt-0 border-t md:border-t-0 border-[#cccbc8]/50">
                    {/* View Details Link (for published or preview) */}
                    <Link to={`/posts/${post.id}`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        title="View Public Presentation"
                        aria-label={`View ${post.title}`}
                      >
                        View
                      </Button>
                    </Link>

                    {/* Edit Button */}
                    <Link to={`/posts/${post.id}/edit`}>
                      <Button variant="outline" size="sm" leftIcon={<Pencil className="h-3.5 w-3.5" />}>
                        Edit
                      </Button>
                    </Link>

                    {/* Quick Publish / Unpublish Toggle */}
                    <Button
                      variant={isPublished ? "outline" : "clay"}
                      size="sm"
                      isLoading={isActionRunning}
                      onClick={() => handleTogglePublish(post)}
                      leftIcon={isPublished ? <Archive className="h-3.5 w-3.5" /> : <Globe className="h-3.5 w-3.5" />}
                      title={
                        !isPublished && !hasImages
                          ? "Requires at least 1 image to publish"
                          : isPublished
                            ? "Unpublish post"
                            : "Publish to public gallery"
                      }
                    >
                      {isPublished ? "Unpublish" : "Publish"}
                    </Button>

                    {/* Delete Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPostToDelete(post)}
                      className="text-[#d97757] hover:bg-[#d97757]/10"
                      aria-label={`Delete ${post.title}`}
                      title="Delete post"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={postToDelete !== null}
        onClose={() => !isDeleting && setPostToDelete(null)}
        title="Delete Exhibition Plate"
        description="This action will permanently withdraw this plate from your archive."
        size="md"
        footer={
          <>
            <Button variant="outline" size="md" disabled={isDeleting} onClick={() => setPostToDelete(null)}>
              Cancel
            </Button>
            <Button variant="clay" size="md" isLoading={isDeleting} onClick={handleConfirmDelete}>
              Delete Permanently
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="font-serif text-base text-[#141413]">
            Are you sure you want to permanently delete{" "}
            <strong className="font-gothic font-bold text-[#141413]">&ldquo;{postToDelete?.title}&rdquo;</strong>?
          </p>
          <div className="p-3.5 rounded-xl bg-[#d97757]/10 border border-[#d97757]/30 text-xs font-serif text-[#141413]/85 leading-relaxed">
            All associated Cloudflare R2 imagery references and portfolio catalog records will be removed immediately.
          </div>
        </div>
      </Modal>
    </div>
  );
};
