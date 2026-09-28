import React, { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Users } from "lucide-react";
import { apiClient } from "@shared/api/apiClient.ts";
import { EmptyState } from "@shared/components/EmptyState.tsx";
import { Skeleton } from "@shared/components/Skeleton.tsx";
import { useAsyncData } from "@shared/hooks/index.ts";
import { FeedSearchBar } from "../components/FeedSearchBar.tsx";
import { MemberProfileCard } from "../components/MemberProfileCard.tsx";

export const SearchResultsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("q") || "";

  const [inputQuery, setInputQuery] = useState(query);

  const { data: allProfiles, isLoading } = useAsyncData(
    () => apiClient.getProfiles()
  );

  // Filter profiles based on the search query
  const matchedProfiles = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed || !allProfiles) return [];

    return allProfiles.filter((p) => {
      const usernameMatch = p.username.toLowerCase().includes(trimmed);
      const nameMatch = (p.name || "").toLowerCase().includes(trimmed);
      const bioMatch = (p.bio || "").toLowerCase().includes(trimmed);
      const specialtyMatch = (p.specialty || "").toLowerCase().includes(trimmed);
      return usernameMatch || nameMatch || bioMatch || specialtyMatch;
    });
  }, [allProfiles, query]);

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
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="bg-ivory-light border border-stone rounded-2xl p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton variant="circular" width={48} height={48} />
                <div className="flex-1 space-y-2">
                  <Skeleton variant="text" width="70%" height={16} />
                  <Skeleton variant="text" width="40%" height={12} />
                </div>
              </div>
              <Skeleton variant="text" width="100%" height={14} />
              <Skeleton variant="text" width="85%" height={14} />
              <Skeleton variant="rectangular" className="w-full h-10 rounded-xl mt-4" />
            </div>
          ))}
        </div>
      ) : matchedProfiles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {matchedProfiles.map((profile) => (
            <MemberProfileCard
              key={profile.id || profile.username}
              profile={profile}
              from={`/feed/search?q=${encodeURIComponent(query)}`}
              fromLabel="Search Results"
            />
          ))}
        </div>
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
