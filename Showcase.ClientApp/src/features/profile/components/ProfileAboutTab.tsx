import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, BookOpen, Edit3, Plus } from "lucide-react";
import { Button } from "@shared/components/Button.tsx";
import { Modal } from "@shared/components/Modal.tsx";
import type { SocialLinkDto } from "@shared/types/index.ts";
import { PlatformIcon } from "./PlatformIcon.tsx";

export interface ProfileAboutTabProps {
  bio?: string | null;
  socialLinks?: SocialLinkDto[];
  isOwnProfile?: boolean;
  creatorName?: string;
  username?: string;
}

export const ProfileAboutTab: React.FC<ProfileAboutTabProps> = ({
  bio,
  socialLinks = [],
  isOwnProfile = false,
  creatorName,
  username,
}) => {
  const [isBioModalOpen, setIsBioModalOpen] = useState(false);
  const sortedSocialLinks = [...socialLinks].sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <section aria-label="About" className="space-y-3.5 sm:space-y-5 max-w-3xl">
      {/* 1. Biography Card (Compact for Mobile) */}
      <div className="bg-[#faf9f5] rounded-2xl sm:rounded-[24px] border border-[#cccbc8]/60 p-5 sm:p-6 lg:p-7 shadow-none">
        <div className="flex items-center justify-between mb-2.5 sm:mb-3">
          <h2 className="font-gothic text-[11px] sm:text-xs font-bold uppercase tracking-[0.16em] text-[#87867f]">
            Biography
          </h2>
          {isOwnProfile && (
            <Link to="/profile/edit" className="text-decoration-none">
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<Edit3 className="h-3 w-3" />}
                className="text-[#87867f] hover:text-[#141413] text-xs h-8 px-2.5"
              >
                Edit
              </Button>
            </Link>
          )}
        </div>

        {bio ? (
          <div>
            <p
              onClick={() => setIsBioModalOpen(true)}
              className="font-serif text-sm sm:text-base leading-relaxed text-[#141413]/85 line-clamp-3 sm:line-clamp-4 cursor-pointer hover:text-[#141413] transition-colors"
              title="Click to view full biography"
            >
              {bio}
            </p>

            <button
              type="button"
              onClick={() => setIsBioModalOpen(true)}
              className="mt-2.5 inline-flex items-center gap-1.5 font-gothic text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#d97757] hover:underline cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Read More</span>
            </button>
          </div>
        ) : (
          <p className="font-serif text-sm italic text-[#87867f]">
            No biography provided yet.
          </p>
        )}
      </div>

      {/* 2. Connect & External Archives Card (Compact for Mobile) */}
      {sortedSocialLinks.length > 0 ? (
        <div className="bg-[#faf9f5] rounded-2xl sm:rounded-[24px] border border-[#cccbc8]/60 p-5 sm:p-6 lg:p-7 shadow-none">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="font-gothic text-[11px] sm:text-xs font-bold uppercase tracking-[0.16em] text-[#87867f]">
              Links &amp; Socials
            </h2>
            {isOwnProfile && (
              <Link to="/profile/social-links" className="text-decoration-none">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Edit3 className="h-3 w-3" />}
                  className="text-xs h-8 px-3"
                >
                  Edit Links
                </Button>
              </Link>
            )}
          </div>

          <div className="flex flex-wrap gap-2 sm:gap-2.5">
            {sortedSocialLinks.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#cccbc8] hover:border-[#141413] bg-[#faf9f5] hover:bg-[#141413] text-[#141413] hover:text-[#faf9f5] transition-all font-gothic text-xs font-semibold uppercase tracking-[0.08em] group shadow-none min-h-[38px]"
              >
                <PlatformIcon platform={link.platform} className="h-3.5 w-3.5 shrink-0 transition-colors" />
                <span>{link.platform}</span>
                <ArrowUpRight className="h-3 w-3 opacity-60 group-hover:opacity-100 transition-opacity" />
              </a>
            ))}
          </div>
        </div>
      ) : isOwnProfile ? (
        <div className="bg-[#faf9f5] rounded-2xl sm:rounded-[24px] border border-[#cccbc8]/60 p-5 sm:p-6 lg:p-7 shadow-none">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-gothic text-[11px] sm:text-xs font-bold uppercase tracking-[0.16em] text-[#87867f]">
              Links &amp; Socials
            </h2>
          </div>
          <p className="font-serif text-xs sm:text-sm text-[#87867f] mb-3">
            No links added yet.
          </p>
          <Link to="/profile/social-links" className="text-decoration-none inline-block">
            <Button variant="outline" size="sm" leftIcon={<Plus className="h-3.5 w-3.5" />} className="text-xs h-7 px-2.5">
              Add Social Links
            </Button>
          </Link>
        </div>
      ) : null}

      {/* 3. Full Biography Alert / Modal */}
      {bio && (
        <Modal
          isOpen={isBioModalOpen}
          onClose={() => setIsBioModalOpen(false)}
          title="Biography"
          description={creatorName ? `${creatorName} ${username ? `(@${username})` : ""}` : undefined}
          size="md"
        >
          <div className="space-y-4 pt-2">
            <div className="p-4 sm:p-5 rounded-2xl bg-[#f0eee6]/50 border border-[#cccbc8]/60 max-h-80 overflow-y-auto pr-2">
              <p className="font-serif text-base sm:text-lg leading-relaxed text-[#141413] whitespace-pre-line">
                {bio}
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                variant="slate"
                size="sm"
                onClick={() => setIsBioModalOpen(false)}
                className="font-gothic text-xs font-bold uppercase tracking-wider"
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
};
