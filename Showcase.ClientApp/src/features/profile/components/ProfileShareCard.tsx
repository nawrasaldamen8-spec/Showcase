import React from "react";
import { Badge } from "@shared/components/Badge.tsx";
import { PoritySymbol } from "@shared/components/BrandLogo.tsx";
import { UserAvatar } from "@shared/components/media/index.ts";
import { VerifiedBadge } from "@shared/components/VerifiedBadge.tsx";
import type { PublicProfileResponse } from "@shared/types/index.ts";

export interface ProfileShareCardProps {
  profile: PublicProfileResponse;
  className?: string;
}

export const ProfileShareCard: React.FC<ProfileShareCardProps> = ({
  profile,
  className = "",
}) => {
  return (
    <div
      className={`relative bg-ivory-light border border-stone/80 rounded-2xl p-6 sm:p-7 text-slate-dark shadow-sm overflow-hidden select-none ${className}`}
    >
      {/* Top: Pority Logo Symbol Alone (Above the Avatar) */}
      <div className="mb-5 flex items-center justify-start">
        <PoritySymbol className="h-7 w-auto text-slate-dark" />
      </div>

      {/* Main Creator Identity */}
      <div className="flex items-start gap-4 sm:gap-5">
        <UserAvatar
          src={profile.avatarUrl}
          alt={profile.name}
          size="xl"
          className="border-2 border-stone shadow-none shrink-0"
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 min-w-0">
            <h2 className="font-gothic font-extrabold text-xl sm:text-2xl text-slate-dark tracking-[-0.02em] truncate">
              {profile.name}
            </h2>
            {profile.isVerified && (
              <VerifiedBadge size="md" className="shrink-0" />
            )}
          </div>

          <div className="font-gothic text-xs font-semibold uppercase tracking-[0.10em] text-cloud-dark mt-0.5 truncate">
            @{profile.username}
          </div>

          {/* Specialty Badge */}
          {profile.specialty && profile.specialty.trim() !== "" && (
            <div className="mt-2.5">
              <Badge variant="stone" size="sm" className="font-gothic text-[10px]">
                {profile.specialty}
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* Bio / Statement */}
      {profile.bio && profile.bio.trim() !== "" && (
        <div className="mt-4">
          <p className="font-serif text-xs sm:text-sm text-slate-dark/85 leading-relaxed line-clamp-3">
            {profile.bio.trim()}
          </p>
        </div>
      )}
    </div>
  );
};
