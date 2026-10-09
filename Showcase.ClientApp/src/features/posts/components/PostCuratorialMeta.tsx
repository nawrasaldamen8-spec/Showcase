import { ArrowRight, ChevronDown, ChevronUp, ExternalLink, Flag } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Badge } from "@shared/components/Badge.tsx";
import { Button } from "@shared/components/Button.tsx";
import { UserAvatar } from "@shared/components/media/index.ts";
import { VerifiedBadge } from "@shared/components/VerifiedBadge.tsx";
import { useAuth } from "@shared/context/index.ts";
import type { PostDetailsResponse } from "@shared/types/index.ts";
import { formatRelativeTime } from "@shared/utils/index.ts";
import { PostLikeButton } from "./PostLikeButton.tsx";
import { ReportPostModal } from "./ReportPostModal.tsx";

export interface PostCuratorialMetaProps {
  post: PostDetailsResponse;
  creatorName: string;
  creatorUsername: string;
  creatorAvatar?: string;
  layout?: "sidebar" | "inline";
  showCreator?: boolean;
}

export const PostCuratorialMeta: React.FC<PostCuratorialMetaProps> = ({
  post,
  creatorName,
  creatorUsername,
  creatorAvatar,
  layout = "inline",
  showCreator = layout === "sidebar",
}) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [canExpand, setCanExpand] = useState(false);
  const descRef = useRef<HTMLParagraphElement>(null);
  const isSidebar = layout === "sidebar";

  useEffect(() => {
    if (!isExpanded && descRef.current) {
      const hasOverflow = descRef.current.scrollHeight > descRef.current.clientHeight + 2;
      const lineCount = (post.description || "").split(/\r\n|\r|\n/).length;
      setCanExpand(hasOverflow || lineCount > 10);
    }
  }, [post.description, isExpanded]);

  return (
    <div className={isSidebar ? "space-y-6 lg:space-y-8" : "space-y-4 pt-1 px-1"}>
      {/* Creator Identity (Rendered in sidebar mode or when explicitly enabled) */}
      {showCreator && (
        <div className="flex items-center gap-3.5">
          <Link to={`/u/${creatorUsername}`} className="shrink-0 group">
            <UserAvatar
              src={creatorAvatar}
              alt={creatorName}
              size="md"
              className="h-12 w-12 border border-stone transition-transform group-hover:scale-105 shrink-0"
            />
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 min-w-0">
              <Link
                to={`/u/${creatorUsername}`}
                className="font-gothic font-bold text-base sm:text-lg uppercase tracking-tight text-slate-dark hover:text-clay transition-colors truncate leading-tight"
              >
                {creatorName}
              </Link>
              {post.creator?.isVerified && <VerifiedBadge size="sm" className="shrink-0" />}
            </div>
            <Link
              to={`/u/${creatorUsername}`}
              className="font-serif text-sm text-cloud-dark hover:text-clay transition-colors truncate block mt-0.5"
            >
              @{creatorUsername}
            </Link>
          </div>
        </div>
      )}

      {/* Exhibition Title (Desktop vs Mobile styling) */}
      {isSidebar ? (
        <h1 className="font-gothic font-extrabold text-2xl sm:text-3xl lg:text-4xl text-slate-dark tracking-[-0.03em] leading-[1.15]">
          {post.title}
        </h1>
      ) : (
        <h1 className="font-gothic font-extrabold text-xl sm:text-2xl text-slate-dark tracking-tight leading-snug">
          {post.title}
        </h1>
      )}

      {/* Action Row: Likes & Discreet Report */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <PostLikeButton
          key={post.id}
          postId={post.id}
          initialLiked={post.isLiked}
          initialCount={post.likeCount}
          size="md"
          variant="pill"
        />

        <button
          type="button"
          onClick={() => {
            if (!currentUser) {
              toast.info("Please sign in to report content.");
              navigate("/login", { state: { from: `${location.pathname}${location.search}` } });
              return;
            }
            setIsReportModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-gothic text-cloud-dark hover:text-clay hover:bg-stone/30 transition-colors border border-transparent hover:border-stone/60 cursor-pointer"
          title="Report this project"
        >
          <Flag className="w-3 h-3" />
          <span className="hidden sm:inline">Report</span>
        </button>
      </div>

      {/* Publication Relative Date */}
      {(post.publishedAt || post.createdAt) && (
        <div className="pt-0.5">
          <time
            dateTime={post.publishedAt || post.createdAt}
            title={new Date(post.publishedAt || post.createdAt).toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            })}
            className="font-serif text-xs text-cloud-dark hover:text-slate-dark transition-colors select-none block"
          >
            {formatRelativeTime(post.publishedAt || post.createdAt, { suffix: true })}
          </time>
        </div>
      )}

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className={`flex flex-wrap ${isSidebar ? "gap-2" : "gap-1.5"} pt-1`}>
          {post.tags.map((tag) => (
            <Badge key={tag} variant="stone" size="sm">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Curatorial Description */}
      {post.description && (
        <div className="pt-1">
          <p
            ref={descRef}
            onClick={() => {
              if (canExpand && !isExpanded) {
                setIsExpanded(true);
              }
            }}
            className={`font-serif leading-relaxed text-slate-dark/85 whitespace-pre-line ${
              isSidebar ? "text-[16px] sm:text-[17px] max-w-prose" : "text-[15px] sm:text-[16px]"
            } ${!isExpanded ? "line-clamp-[10]" : ""} ${
              canExpand && !isExpanded ? "cursor-pointer hover:text-slate-dark transition-colors" : ""
            }`}
            title={canExpand && !isExpanded ? "Click to read full description" : undefined}
          >
            {post.description}
          </p>

          {canExpand && (
            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              className="inline-flex items-center gap-1.5 font-gothic text-[11px] font-bold uppercase tracking-wider text-clay hover:text-slate-dark transition-colors mt-2 cursor-pointer bg-transparent border-none p-0 select-none"
            >
              <span>{isExpanded ? "Show less" : "Read more"}</span>
              {isExpanded ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </button>
          )}
        </div>
      )}

      {/* External Reference */}
      {post.externalUrl && (
        <div className="pt-1">
          <a
            href={post.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-gothic text-xs font-semibold uppercase tracking-[0.12em] text-slate-dark hover:text-clay transition-colors border-b border-slate-dark hover:border-clay pb-0.5"
          >
            <span>Live Project Link</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}

      {/* Profile Button */}
      <div
        className={`border-t border-stone/40 flex items-center justify-between ${
          isSidebar ? "pt-4" : "pt-3"
        }`}
      >
        <Link
          to={`/u/${creatorUsername}`}
          className={`inline-block text-decoration-none ${
            isSidebar ? "" : "w-full sm:w-auto"
          }`}
        >
          <Button
            variant="slate"
            size="md"
            className={isSidebar ? undefined : "w-full sm:w-auto justify-center"}
            rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
          >
            View Profile
          </Button>
        </Link>
      </div>

      <ReportPostModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        postId={post.id}
        postTitle={post.title}
        creatorUsername={creatorUsername}
      />
    </div>
  );
};
