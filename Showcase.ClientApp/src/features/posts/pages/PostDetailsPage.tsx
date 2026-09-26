import { ArrowLeft, Pencil } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { apiClient } from "@shared/api/apiClient.ts";
import { Button } from "@shared/components/Button.tsx";
import { Lightbox } from "@shared/components/Lightbox.tsx";
import { NotFoundView } from "@shared/components/NotFoundView.tsx";
import { Skeleton } from "@shared/components/Skeleton.tsx";
import { useAuth } from "@shared/context/index.ts";
import type { PostDetailsResponse, PublicProfileResponse } from "@shared/types/index.ts";
import { PostDetailDesktop, PostDetailMobile } from "../components/index.ts";

export const PostDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const fromState = location.state as { from?: string; fromLabel?: string } | null;

  const [post, setPost] = useState<PostDetailsResponse | null>(null);
  const [creatorProfile, setCreatorProfile] = useState<PublicProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadPostData() {
      if (!id) {
        if (isMounted) {
          setNotFound(true);
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);
      setError(null);
      setNotFound(false);
      try {
        const postData = await apiClient.getPostById(id as string);
        if (!isMounted) return;
        setPost(postData);

        if (postData.creator?.username) {
          try {
            const profile = await apiClient.getPublicProfile(postData.creator.username);
            if (isMounted) setCreatorProfile(profile);
          } catch {
            // Non-critical fallback
          }
        }
      } catch (err: unknown) {
        if (!isMounted) return;
        const status = (err as { status?: number })?.status;
        if (status === 404) setNotFound(true);
        else setError("Unable to load project details. Please try again.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadPostData();
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 animate-pulse">
        <Skeleton variant="text" width={100} height={20} className="mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 items-start">
          <div className="md:col-span-7 xl:col-span-7">
            <Skeleton variant="rectangular" className="w-full h-[55vh] max-h-[600px] rounded-[24px]" />
          </div>
          <div className="md:col-span-5 xl:col-span-5 space-y-6">
            <div className="flex items-center gap-3">
              <Skeleton variant="circular" width={44} height={44} />
              <div className="space-y-1.5 flex-1">
                <Skeleton variant="text" width="60%" height={16} />
                <Skeleton variant="text" width="40%" height={14} />
              </div>
            </div>
            <Skeleton variant="text" width="85%" height={36} />
            <div className="flex gap-2">
              <Skeleton variant="rectangular" width={70} height={24} className="rounded-full" />
              <Skeleton variant="rectangular" width={80} height={24} className="rounded-full" />
            </div>
            <Skeleton variant="text" width="100%" height={18} />
            <Skeleton variant="text" width="90%" height={18} />
            <Skeleton variant="text" width="75%" height={18} />
            <Skeleton variant="rectangular" width={140} height={40} className="rounded-full mt-4" />
          </div>
        </div>
        <div className="mt-12 pt-10 border-t border-[#cccbc8]/50 grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          <Skeleton variant="rectangular" className="w-full h-64 rounded-[24px]" />
          <Skeleton variant="rectangular" className="w-full h-64 rounded-[24px]" />
        </div>
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <NotFoundView
        eyebrow="Error 404"
        title="Project Not Found"
        description="The requested project may have been moved, set to draft status by its author, or does not exist."
        backHref="/studio"
        backLabel="Back to Studio"
      />
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-[#faf9f5] border border-[#d97757]/40 rounded-[24px] p-8">
          <p className="font-serif text-lg text-[#141413]">{error}</p>
          <div className="mt-6 flex justify-center gap-4">
            <Link to="/studio">
              <Button variant="outline" size="sm">
                Back to Studio
              </Button>
            </Link>
            <Button variant="slate" size="sm" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const creatorName = post.creator ? `${post.creator.firstName} ${post.creator.lastName}` : "Creator";
  const creatorUsername = post.creator?.username || "user";
  const creatorAvatar = (creatorProfile?.avatarUrl || post.creator?.avatarUrl) ?? undefined;

  const isOwnPost = Boolean(
    currentUser?.username &&
    post.creator?.username &&
    currentUser.username.toLowerCase() === post.creator.username.toLowerCase()
  );

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    if (fromState?.from) {
      navigate(fromState.from);
    } else if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate(isOwnPost ? "/studio" : "/feed");
    }
  };

  const backLabel = fromState?.fromLabel || (isOwnPost ? "Studio" : "Feed");

  return (
    <article className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-10">
      <nav className="mb-8 sm:mb-10 flex items-center justify-between gap-4 text-xs font-gothic uppercase tracking-[0.12em]">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-[#87867f] hover:text-[#141413] transition-colors group shrink-0 font-medium cursor-pointer bg-transparent border-none p-0"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span>{backLabel}</span>
        </button>
        {isOwnPost && (
          <Link
            to={`/posts/${post.id}/edit`}
            state={{ from: `/posts/${post.id}`, fromLabel: post.title }}
            className="shrink-0 text-decoration-none"
          >
            <Button variant="outline" size="sm" leftIcon={<Pencil className="h-3.5 w-3.5" />}>
              Edit
            </Button>
          </Link>
        )}
      </nav>

      <PostDetailMobile
        post={post}
        creatorName={creatorName}
        creatorUsername={creatorUsername}
        creatorAvatar={creatorAvatar}
        onInspectImage={setLightboxIndex}
      />

      <PostDetailDesktop
        post={post}
        creatorName={creatorName}
        creatorUsername={creatorUsername}
        creatorAvatar={creatorAvatar}
        onInspectImage={setLightboxIndex}
      />

      {lightboxIndex !== null && (
        <Lightbox
          images={post.images.map((img) => ({ url: img.url, alt: post.title }))}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onIndexChange={(newIdx) => setLightboxIndex(newIdx)}
        />
      )}
    </article>
  );
};
