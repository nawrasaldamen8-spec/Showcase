import React, { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Users } from "lucide-react";
import { EmptyState } from "@shared/components/EmptyState.tsx";
import { useInfiniteScroll } from "@shared/hooks/useInfiniteScroll.ts";
import { useInfiniteProfilesQuery } from "@features/profile/hooks/index.ts";
import { FeedSearchBar } from "../components/FeedSearchBar.tsx";
import { MemberProfileCard } from "../components/MemberProfileCard.tsx";
import { MemberProfileCardSkeleton } from "../components/MemberProfileCardSkeleton.tsx";

export const SearchResultsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("q") || "";

  const [inputQuery, setInputQuery] = useState(query);

  const {
    data,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteProfilesQuery({ search: query, pageSize: 24 });

  const sentinelRef = useInfiniteScroll({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    rootMargin: "350px",
  });

  const matchedProfiles = useMemo(() => {
    return data?.pages.flatMap((page) => page.items) || [];
  }, [data]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim()) return;
    navigate(`/feed/search?q=${encodeURIComponent(inputQuery.trim())}`);
  };

  return (
    <div className="min-h-screen bg-ivory-medium text-slate-dark py-6 sm:py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* 1. Breadcrumb & Header with Search on same level */}
      <div className="mb-6">
        <Link
          to="/feed"
          className="inline-flex items-center gap-2 font-gothic text-xs font-bold uppercase tracking-wider text-cloud-dark hover:text-slate-dark transition-colors mb-4 text-decoration-none"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Community</span>
        </Link>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-stone/60">
          <div>
            <h1 className="font-gothic text-xl sm:text-2xl font-bold uppercase tracking-tight text-slate-dark">
              Search Results
            </h1>
            <p className="font-serif text-sm text-cloud-dark mt-0.5">
              {query ? (
                <>
                  Query: <span className="font-semibold text-clay">&ldquo;{query}&rdquo;</span>
                </>
              ) : (
                "Please enter a search query."
              )}
            </p>
          </div>

          <FeedSearchBar
            value={inputQuery}
            onChange={setInputQuery}
            onSubmit={handleSearchSubmit}
            placeholder="Search people..."
          />
        </div>
      </div>

      {/* 2. Results List OR Empty State */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          <MemberProfileCardSkeleton count={6} />
        </div>
      ) : matchedProfiles.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {matchedProfiles.map((profile) => (
              <MemberProfileCard
                key={profile.id || profile.username}
                profile={profile}
                from={`/feed/search?q=${encodeURIComponent(query)}`}
                fromLabel="Search Results"
              />
            ))}
            {isFetchingNextPage && <MemberProfileCardSkeleton count={3} />}
          </div>

          {/* Sentinel for Infinite Scroll Trigger */}
          <div ref={sentinelRef} className="h-6 w-full" aria-hidden="true" />
        </>
      ) : (
        <EmptyState
          icon={Users}
          eyebrow="No Matches"
          title={`No members found for "${query}"`}
          description="No matching profiles found. Try searching by name, username, or specialty."
          actionLabel="Browse All Members"
          actionIcon={<ArrowLeft className="w-4 h-4" />}
          onAction={() => navigate("/feed")}
        />
      )}
    </div>
  );
};
