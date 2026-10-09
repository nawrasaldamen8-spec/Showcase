import { ArrowRight } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";
import { Badge } from "@shared/components/Badge.tsx";
import { UserAvatar } from "@shared/components/media/index.ts";
import { VerifiedBadge } from "@shared/components/VerifiedBadge.tsx";
import type { Profile, ProfileDetailsResponse, PublicProfileResponse } from "@shared/types/index.ts";

export interface MemberProfileCardProps {
  profile: Profile | ProfileDetailsResponse | PublicProfileResponse;
  from?: string;
  fromLabel?: string;
}

export const MemberProfileCard: React.FC<MemberProfileCardProps> = ({
  profile,
  from = "/feed",
  fromLabel = "Feed Directory",
}) => {
  return (
    <div className="group bg-ivory-light border border-stone rounded-2xl p-5 sm:p-6 flex flex-col justify-between hover:border-clay transition-all duration-200 shadow-none">
      <div>
        {/* Header: Avatar, Name, Handle & Specialty */}
        <div className="flex items-start gap-3.5 mb-4">
          <UserAvatar
            src={profile.avatarUrl}
            alt={profile.name}
            size="md"
            className="w-12 h-12 border border-stone/80 group-hover:border-clay transition-colors shrink-0"
          />

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 min-w-0">
              <h3 className="font-gothic text-base font-bold text-slate-dark truncate group-hover:text-clay transition-colors">
                {profile.name}
              </h3>
              {profile.isVerified && <VerifiedBadge size="xs" className="shrink-0" />}
            </div>
            <p className="font-serif text-xs text-cloud-dark truncate mb-1.5">
              @{profile.username}
            </p>
            {profile.specialty && profile.specialty.trim() !== "" && (
              <Badge
                variant="stone"
                size="sm"
                className="font-gothic text-[8.5px] uppercase tracking-wider inline-flex max-w-full truncate px-2 py-0.5"
              >
                {profile.specialty}
              </Badge>
            )}
          </div>
        </div>

        {/* Bio Snippet */}
        <p className="font-serif text-sm text-slate-dark/80 leading-relaxed line-clamp-3 mb-5">
          {profile.bio || "Member on Pority."}
        </p>
      </div>

      {/* Full Width View Profile Button */}
      <div className="pt-3 border-t border-stone/50">
        <Link
          to={`/u/${profile.username}`}
          state={{ from, fromLabel }}
          className="w-full py-2.5 px-4 rounded-xl bg-slate-dark text-ivory-light font-gothic text-xs font-bold uppercase tracking-wider hover:bg-clay transition-colors text-decoration-none flex items-center justify-center gap-2"
        >
          <span>View Profile</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
