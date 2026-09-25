import { ArrowUpRight } from "lucide-react";
import React from "react";
import type { SocialLinkDto } from "@shared/types/index.ts";
import { PlatformIcon } from "./PlatformIcon.tsx";

export interface ProfileAboutTabProps {
  bio?: string | null;
  socialLinks?: SocialLinkDto[];
}

export const ProfileAboutTab: React.FC<ProfileAboutTabProps> = ({ bio, socialLinks = [] }) => {
  const sortedSocialLinks = [...socialLinks].sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <section aria-label="About Creator" className="space-y-6 max-w-3xl">
      <div className="bg-[#faf9f5] rounded-[24px] border border-[#cccbc8]/60 p-6 sm:p-8">
        <h2 className="font-gothic text-xs font-bold uppercase tracking-[0.16em] text-[#87867f] mb-3">Biography</h2>
        {bio ? (
          <p className="font-serif text-[17px] sm:text-[19px] leading-relaxed text-[#141413]/85 whitespace-pre-line">
            {bio}
          </p>
        ) : (
          <p className="font-serif text-[16px] italic text-[#87867f]">No biography provided yet.</p>
        )}
      </div>

      {sortedSocialLinks.length > 0 && (
        <div className="bg-[#faf9f5] rounded-[24px] border border-[#cccbc8]/60 p-6 sm:p-8">
          <h2 className="font-gothic text-xs font-bold uppercase tracking-[0.16em] text-[#87867f] mb-4">
            Connect &amp; External Archives
          </h2>
          <div className="flex flex-wrap gap-3">
            {sortedSocialLinks.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full border border-[#cccbc8] hover:border-[#141413] bg-[#faf9f5] hover:bg-[#141413] text-[#141413] hover:text-[#faf9f5] transition-all font-gothic text-xs font-semibold uppercase tracking-[0.10em] group shadow-none"
              >
                <PlatformIcon platform={link.platform} className="h-4 w-4 shrink-0 transition-colors" />
                <span>{link.platform}</span>
                <ArrowUpRight className="h-3 w-3 opacity-60 group-hover:opacity-100 transition-opacity" />
              </a>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
