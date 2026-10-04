import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, User as UserIcon } from "lucide-react";
import { EmptyState } from "@shared/components/EmptyState.tsx";
import { useAuth } from "@shared/context/index.ts";
import { useInfiniteScroll } from "@shared/hooks/useInfiniteScroll.ts";
import { useInfiniteProfilesQuery } from "@features/profile/hooks/index.ts";
import { FeedSearchBar } from "../components/FeedSearchBar.tsx";
import { MemberProfileCard } from "../components/MemberProfileCard.tsx";
import { MemberProfileCardSkeleton } from "../components/MemberProfileCardSkeleton.tsx";

export const FeedPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteProfilesQuery({ featuredOnly: true, pageSize: 24 });

  const sentinelRef = useInfiniteScroll({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    rootMargin: "350px",
  });

  const list = useMemo(() => {
    return data?.pages.flatMap((page) => page.items) || [];
  }, [data]);

  const totalCount = data?.pages[0]?.totalCount ?? list.length;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    navigate(`/feed/search?q=${encodeURIComponent(searchTerm.trim())}`);
  };

  return (
    <div className="min-h-screen bg-ivory-medium text-slate-dark py-6 sm:py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* 1. Header & Search Bar on Same Level */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-stone/60">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-ivory-light border border-stone/60 text-cloud-dark mb-2">
              <Sparkles className="w-3 h-3 text-clay" />
              <span className="font-gothic text-[10px] font-bold uppercase tracking-[0.16em]">
                Community
              </span>
            </div>
            <h1 className="font-gothic text-xl sm:text-2xl font-bold uppercase tracking-tight text-slate-dark">
              Community Directory
            </h1>
          </div>

          <FeedSearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            onSubmit={handleSearchSubmit}
            placeholder="Search people..."
          />
        </div>
      </div>

      {/* 2. Community Creators Grid OR Empty State */}
      <div className="mb-8">
        <div className="mb-5">
          <h2 className="font-gothic text-base sm:text-lg font-bold uppercase tracking-tight text-slate-dark">
            Featured Members ({isLoading ? "..." : totalCount})
          </h2>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            <MemberProfileCardSkeleton count={6} />
          </div>
        ) : list.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {list.map((profile) => (
                <MemberProfileCard
                  key={profile.id || profile.username}
                  profile={profile}
                  from="/feed"
                  fromLabel="Feed Directory"
                />
              ))}
              {isFetchingNextPage && <MemberProfileCardSkeleton count={3} />}
            </div>

            {/* Sentinel for Infinite Scroll Trigger */}
            <div ref={sentinelRef} className="h-6 w-full" aria-hidden="true" />
          </>
        ) : isAuthenticated ? (
          <EmptyState
            icon={Sparkles}
            title="No Featured Creators Yet"
            description="Approved creators appear here. Request a spotlight or search members."
            eyebrow="Community Spotlight"
            actionLabel="Request Featured Spotlight"
            onAction={() => navigate("/settings/security/featured")}
            actionVariant="clay"
          />
        ) : (
          <EmptyState
            icon={UserIcon}
            title="No Featured Creators Yet"
            description="Explore verified practitioners and studios across the Pority community."
            eyebrow="Community Directory"
            actionLabel="Register New Profile"
            onAction={() => navigate("/register")}
            actionVariant="clay"
          />
        )}
      </div>
    </div>
  );
};
