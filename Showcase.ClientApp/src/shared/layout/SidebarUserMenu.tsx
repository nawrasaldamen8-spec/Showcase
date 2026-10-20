import { LogOut } from "lucide-react";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { AvatarActionModal } from "@features/profile/components/AvatarActionModal.tsx";
import { UserAvatar } from "../components/media/UserAvatar.tsx";
import { VerifiedBadge } from "../components/VerifiedBadge.tsx";
import type { SidebarUser } from "./SidebarNavLinks.tsx";

export interface SidebarUserMenuProps {
  user?: SidebarUser | null;
  onLogout?: () => void;
}

export const SidebarUserMenu: React.FC<SidebarUserMenuProps> = ({ user, onLogout }) => {
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  if (!user) {
    return (
      <div className="w-full flex items-center justify-between p-2 rounded-xl border border-[#262624] bg-[#1a1a19]">
        <Link
          to="/login"
          className="flex items-center gap-2.5 min-w-0 flex-1 hover:opacity-85 transition-opacity text-decoration-none text-ivory-light"
        >
          <UserAvatar size="sm" className="border border-ivory-light/20 shrink-0" />
          <div className="min-w-0">
            <p className="font-gothic text-xs font-bold uppercase tracking-wider text-ivory-light truncate">
              Visitor
            </p>
            <p className="font-serif text-[11px] text-cloud-dark truncate">
              Sign In
            </p>
          </div>
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="w-full flex items-center justify-between p-2 rounded-xl border border-[#262624] bg-[#1a1a19] text-left">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <button
            type="button"
            onClick={() => setIsAvatarModalOpen(true)}
            className="cursor-pointer group relative shrink-0 rounded-full focus-visible:outline-2 focus-visible:outline-clay"
            title="Update Profile Photo"
            aria-label="Update Profile Photo"
          >
            <UserAvatar
              src={user.avatarUrl}
              alt={user.username}
              size="sm"
              className="border border-[#262624] group-hover:opacity-80 transition-opacity shrink-0"
            />
          </button>

          <Link
            to={`/u/${user.username}`}
            className="min-w-0 flex-1 hover:opacity-85 transition-opacity text-decoration-none group"
            title={`View @${user.username} Profile`}
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <p className="font-gothic text-xs font-bold uppercase tracking-wider text-ivory-light truncate group-hover:text-clay transition-colors">
                {user.name || user.username}
              </p>
              {user.isVerified && <VerifiedBadge size="xs" className="shrink-0" />}
            </div>
            <p className="font-serif text-[11px] text-cloud-dark truncate">
              @{user.username}
            </p>
          </Link>
        </div>

        {/* Direct Log Out Button replacing gear icon */}
        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            title="Sign Out"
            aria-label="Sign Out"
            className="p-1.5 rounded-lg text-cloud-dark hover:text-clay hover:bg-[#262624] transition-colors cursor-pointer shrink-0 ml-1.5"
          >
            <LogOut className="h-4 w-4" />
          </button>
        )}
      </div>

      <AvatarActionModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        avatarUrl={user.avatarUrl}
        name={user.name}
        username={user.username}
      />
    </>
  );
};

