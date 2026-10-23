import { ArrowLeft, Pencil } from "lucide-react";
import React, { useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { Button } from "@shared/components/Button.tsx";
import { Lightbox } from "@shared/components/Lightbox.tsx";
import { NotFoundView } from "@shared/components/NotFoundView.tsx";
import { useAuth } from "@shared/context/index.ts";
import { useMediaQuery } from "@shared/hooks/index.ts";
import { usePostDetailsQuery } from "../hooks/usePostQueries.ts";
import { usePublicProfileQuery } from "../../profile/hooks/useProfileQueries.ts";
import { PostDetailDesktop, PostDetailMobile, PostDetailSkeleton } from "../components/index.ts";

export const PostDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const location = useLocation();
  const navigate = useNavigate();

  const fromState = location.state as { from?: string; fromLabel?: string } | null;
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const { data: post, isLoading, isError } = usePostDetailsQuery(id || "");
  const { data: creatorProfile } = usePublicProfileQuery(post?.creator?.username || "", {
    enabled: Boolean(post?.creator?.username),
  });

  if (isLoading) {
    return <PostDetailSkeleton />;
  }

  if (isError || !post) {
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

  const creatorName = post.creator?.name || "Creator";
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
          className="inline-flex items-center gap-2 text-cloud-dark hover:text-slate-dark transition-colors group shrink-0 font-medium cursor-pointer bg-transparent border-none p-0"
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

      {isDesktop ? (
        <PostDetailDesktop
          post={post}
          creatorName={creatorName}
          creatorUsername={creatorUsername}
          creatorAvatar={creatorAvatar}
          onInspectImage={setLightboxIndex}
        />
      ) : (
        <PostDetailMobile
          post={post}
          creatorName={creatorName}
          creatorUsername={creatorUsername}
          creatorAvatar={creatorAvatar}
          onInspectImage={setLightboxIndex}
        />
      )}

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
