import { Edit3, Share2, User as UserIcon } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@shared/components/Button.tsx";
import type { PublicProfileResponse } from "@shared/types/index.ts";

export interface ProfileHeaderProps {
  profile: PublicProfileResponse;
  isOwnProfile: boolean;
  onShare: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ profile, isOwnProfile, onShare }) => {
  const fullName = `${profile.firstName} ${profile.lastName}`.trim();

  return (
    <header className="bg-[#faf9f5] rounded-[24px] border border-[#cccbc8]/60 p-6 sm:p-8 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 sm:gap-6">
        {/* Creator Identity */}
        <div className="flex items-center gap-4 sm:gap-6">
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={fullName}
              className="h-16 w-16 sm:h-20 sm:w-20 rounded-full object-cover border-2 border-[#cccbc8]/70 shrink-0"
            />
          ) : (
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-[#141413] text-[#faf9f5] flex items-center justify-center font-gothic text-xl sm:text-2xl font-extrabold uppercase shrink-0">
              {profile.firstName?.[0] || <UserIcon className="h-8 w-8" />}
            </div>
          )}

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-gothic text-xs font-semibold uppercase tracking-[0.10em] text-[#87867f]">
                @{profile.username}
              </span>
            </div>
            <h1 className="font-gothic font-extrabold text-2xl sm:text-3xl text-[#141413] tracking-[-0.02em]">
              {fullName}
            </h1>
          </div>
        </div>

        {/* Action Buttons: Edit Profile + Share */}
        <div className="flex items-center gap-2.5 sm:gap-3 self-start sm:self-center">
          {isOwnProfile && (
            <Link to="/settings/profile" className="text-decoration-none">
              <Button variant="outline" size="sm" leftIcon={<Edit3 className="h-3.5 w-3.5" />}>
                Edit Profile
              </Button>
            </Link>
          )}

          <Button variant="outline" size="sm" onClick={onShare} leftIcon={<Share2 className="h-3.5 w-3.5" />}>
            Share
          </Button>
        </div>
      </div>
    </header>
  );
};
