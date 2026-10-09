import { Edit3, Flag, MoreVertical, Share2 } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Badge } from "@shared/components/Badge.tsx";
import { UserAvatar } from "@shared/components/media/index.ts";
import { VerifiedBadge } from "@shared/components/VerifiedBadge.tsx";
import { useAuth } from "@shared/context/index.ts";
import type { PublicProfileResponse } from "@shared/types/index.ts";
import { ReportProfileModal } from "./ReportProfileModal.tsx";

export interface ProfileHeaderProps {
  profile: PublicProfileResponse;
  isOwnProfile: boolean;
  onShare: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ profile, isOwnProfile, onShare }) => {
  const fullName = profile.name || `@${profile.username}`;
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <header className="relative bg-ivory-light rounded-2xl sm:rounded-card border border-stone/60 p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 shadow-none">
      <div className="flex items-start justify-between gap-3 sm:gap-4">
        {/* Creator Identity */}
        <div className="flex items-center gap-3.5 sm:gap-6 min-w-0 flex-1 pr-2 sm:pr-4">
          <UserAvatar
            src={profile.avatarUrl}
            alt={fullName}
            size="xl"
            loading="eager"
            fetchPriority="high"
            className="border-2 border-stone/70"
          />

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 min-w-0">
              <h1 className="font-gothic font-extrabold text-xl sm:text-3xl text-slate-dark tracking-[-0.02em] truncate">
                {fullName}
              </h1>
              {profile.isVerified && <VerifiedBadge size="md" className="shrink-0" />}
            </div>
            <div className="flex items-center gap-2 mt-0.5 sm:mt-1">
              <span className="font-gothic text-[11px] sm:text-xs font-semibold uppercase tracking-[0.10em] text-cloud-dark truncate">
                @{profile.username}
              </span>
            </div>
            {profile.specialty && profile.specialty.trim() !== "" && (
              <div className="mt-1.5 sm:mt-2 flex items-center gap-2">
                <Badge
                  variant="stone"
                  size="sm"
                  title={profile.specialty}
                  className="max-w-full sm:max-w-md cursor-default"
                >
                  {profile.specialty}
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Top-Right 3-Dots Action Menu */}
        <div className="relative shrink-0" ref={menuRef}>
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-label="Profile actions"
            aria-expanded={isMenuOpen}
            className="flex items-center justify-center h-10 w-10 rounded-xl text-cloud-dark hover:text-slate-dark hover:bg-[#e8e5dc]/60 active:scale-95 transition-all cursor-pointer"
          >
            <MoreVertical className="h-5 w-5" />
          </button>

          {/* Popover Dropdown */}
          {isMenuOpen && (
            <div
              role="menu"
              className="absolute top-11 right-0 w-48 bg-ivory-light border border-stone rounded-2xl p-1.5 z-30 animate-in fade-in zoom-in-95 duration-100"
            >
              {isOwnProfile ? (
                <>
                  <Link
                    to="/profile/edit"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2.5 w-full px-3.5 py-2.5 rounded-xl font-gothic text-xs font-bold uppercase tracking-wider text-slate-dark hover:bg-slate-dark hover:text-ivory-light transition-colors text-decoration-none"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onShare();
                    }}
                    className="flex items-center gap-2.5 w-full px-3.5 py-2.5 rounded-xl font-gothic text-xs font-bold uppercase tracking-wider text-slate-dark hover:bg-slate-dark hover:text-ivory-light transition-colors cursor-pointer text-left"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share Profile</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onShare();
                    }}
                    className="flex items-center gap-2.5 w-full px-3.5 py-2.5 rounded-xl font-gothic text-xs font-bold uppercase tracking-wider text-slate-dark hover:bg-slate-dark hover:text-ivory-light transition-colors cursor-pointer text-left"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share Profile</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      if (!currentUser) {
                        toast.info("Please sign in to report profiles.");
                        navigate("/login", { state: { from: `${location.pathname}${location.search}` } });
                        return;
                      }
                      setIsReportModalOpen(true);
                    }}
                    className="flex items-center gap-2.5 w-full px-3.5 py-2.5 rounded-xl font-gothic text-xs font-bold uppercase tracking-wider text-clay hover:bg-clay hover:text-ivory-light transition-colors cursor-pointer text-left"
                  >
                    <Flag className="w-4 h-4" />
                    <span>Report Profile</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Report Modal */}
      {!isOwnProfile && (
        <ReportProfileModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          username={profile.username}
          fullName={fullName}
        />
      )}
    </header>
  );
};
