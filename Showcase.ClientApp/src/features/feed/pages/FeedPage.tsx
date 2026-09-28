import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, User as UserIcon } from "lucide-react";
import { apiClient } from "@shared/api/apiClient.ts";
import { EmptyState } from "@shared/components/EmptyState.tsx";
import { Skeleton } from "@shared/components/Skeleton.tsx";
import { useAsyncData } from "@shared/hooks/index.ts";
import { FeedSearchBar } from "../components/FeedSearchBar.tsx";
import { MemberProfileCard } from "../components/MemberProfileCard.tsx";

export const FeedPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: profiles, isLoading } = useAsyncData(
    () => apiClient.getProfiles()
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    navigate(`/feed/search?q=${encodeURIComponent(searchTerm.trim())}`);
  };

  const list = profiles || [];

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
            Members ({isLoading ? "..." : list.length})
          </h2>
        </div>

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
        ) : list.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {list.map((profile) => (
              <MemberProfileCard
                key={profile.id || profile.username}
                profile={profile}
                from="/feed"
                fromLabel="Feed Directory"
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={UserIcon}
            title="No Members Registered Yet"
            description="The community directory is currently fresh and clean. Be the first creator to join and build your public profile."
            eyebrow="Community Fresh Start"
            actionLabel="Register New Profile"
            onAction={() => navigate("/register")}
            actionVariant="clay"
          />
        )}
      </div>
    </div>
  );
};
