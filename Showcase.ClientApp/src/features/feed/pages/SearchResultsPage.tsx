import React, { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Search, User as UserIcon, Users } from "lucide-react";
import { mockDb } from "@shared/api/mockDb.ts";
import { INITIAL_PROFILES } from "@shared/api/mockData.profiles.ts";
import { Badge } from "@shared/components/Badge.tsx";
import { EmptyState } from "@shared/components/EmptyState.tsx";
import { VerifiedBadge } from "@shared/components/VerifiedBadge.tsx";
import type { Profile } from "@shared/types/index.ts";

export const SearchResultsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("q") || "";

  const [inputQuery, setInputQuery] = useState(query);

  // Load all profiles
  const allProfiles: Profile[] = useMemo(() => {
    try {
      const db = mockDb.loadDb();
      if (db.profiles && db.profiles.length > 0) {
        return db.profiles;
      }
    } catch {
      // Fallback
    }
    return INITIAL_PROFILES;
  }, []);

  // Filter profiles based on the search query
  const matchedProfiles = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return [];

    return allProfiles.filter((p) => {
      const usernameMatch = p.username.toLowerCase().includes(trimmed);
      const nameMatch = `${p.firstName} ${p.lastName}`.toLowerCase().includes(trimmed);
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
    <div className="min-h-screen bg-[#f0eee6] text-[#141413] py-6 sm:py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* 1. Breadcrumb & Header with Search on same level */}
      <div className="mb-6">
        <Link
          to="/feed"
          className="inline-flex items-center gap-2 font-gothic text-xs font-bold uppercase tracking-wider text-[#87867f] hover:text-[#141413] transition-colors mb-4 text-decoration-none"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Community</span>
        </Link>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-[#cccbc8]/60">
          <div>
            <h1 className="font-gothic text-xl sm:text-2xl font-bold uppercase tracking-tight text-[#141413]">
              Search Results
            </h1>
            <p className="font-serif text-sm text-[#87867f] mt-0.5">
              {query ? (
                <>
                  Query: <span className="font-semibold text-[#d97757]">&ldquo;{query}&rdquo;</span>
                </>
              ) : (
                "Please enter a search query."
              )}
            </p>
          </div>

          {/* Refined Search Form on Same Level */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center gap-2 w-full md:w-80 lg:w-96"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#87867f]" />
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="Search people..."
                className="w-full pl-10 pr-3.5 py-2.5 min-h-[42px] bg-[#faf9f5] border border-[#cccbc8] rounded-xl font-serif text-sm text-[#141413] placeholder-[#87867f] focus:outline-none focus:border-[#d97757] transition-all"
              />
            </div>
            <button
              type="submit"
              aria-label="Search"
              className="h-[42px] px-3.5 sm:px-4 rounded-xl bg-[#d97757] hover:bg-[#c86646] text-[#faf9f5] flex items-center justify-center gap-1.5 font-gothic text-xs font-bold uppercase tracking-wider active:scale-95 transition-all cursor-pointer shrink-0"
            >
              <Search className="w-4 h-4 stroke-[2.2]" />
              <span className="hidden sm:inline">Search</span>
            </button>
          </form>
        </div>
      </div>

      {/* 2. Results List OR Empty State */}
      {matchedProfiles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {matchedProfiles.map((profile) => (
            <div
              key={profile.id || profile.username}
              className="group bg-[#faf9f5] border border-[#cccbc8] rounded-2xl p-5 sm:p-6 flex flex-col justify-between hover:border-[#d97757] transition-all duration-200 shadow-none"
            >
              <div>
                {/* Header: Avatar, Name & Specialty Badge at Top-Right */}
                <div className="flex items-start justify-between gap-2.5 sm:gap-3 mb-4">
                  <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 flex-1">
                    {profile.avatarUrl ? (
                      <img
                        src={profile.avatarUrl}
                        alt={`${profile.firstName} ${profile.lastName}`}
                        className="w-12 h-12 rounded-full object-cover border border-[#cccbc8]/80 group-hover:border-[#d97757] transition-colors shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-[#f0eee6] border border-[#cccbc8]/80 flex items-center justify-center text-[#87867f] shrink-0">
                        <UserIcon className="w-5 h-5" />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <h3 className="font-gothic text-base font-bold text-[#141413] truncate group-hover:text-[#d97757] transition-colors">
                          {profile.firstName} {profile.lastName}
                        </h3>
                        {profile.isVerified && <VerifiedBadge size="xs" className="shrink-0" />}
                      </div>
                      <p className="font-serif text-xs text-[#87867f] truncate">
                        @{profile.username}
                      </p>
                    </div>
                  </div>

                  {/* Specialty Badge at Top Right */}
                  <Badge
                    variant="stone"
                    size="sm"
                    className="shrink-0 font-gothic text-[8.5px] uppercase tracking-wider whitespace-nowrap px-2 py-0.5"
                  >
                    {profile.specialty || "Professional"}
                  </Badge>
                </div>

                {/* Bio Snippet */}
                <p className="font-serif text-sm text-[#141413]/80 leading-relaxed line-clamp-3 mb-5">
                  {profile.bio || "Member on Pority."}
                </p>
              </div>

              {/* Full Width View Profile Button */}
              <div className="pt-3 border-t border-[#cccbc8]/50">
                <Link
                  to={`/u/${profile.username}`}
                  state={{ from: `/feed/search?q=${encodeURIComponent(query)}`, fromLabel: "Search Results" }}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#141413] text-[#faf9f5] font-gothic text-xs font-bold uppercase tracking-wider hover:bg-[#d97757] transition-colors text-decoration-none flex items-center justify-center gap-2"
                >
                  <span>View Profile</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
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
