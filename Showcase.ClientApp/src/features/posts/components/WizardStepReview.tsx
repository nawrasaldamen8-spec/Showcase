import { ExternalLink, Globe, Save } from "lucide-react";
import React from "react";
import { Badge } from "@shared/components/Badge.tsx";
import type { ImageGridItem } from "./ImageReorderGrid.tsx";

export interface WizardStepReviewProps {
  images: ImageGridItem[];
  title: string;
  description: string;
  externalUrl: string;
  normalizedUrl: string | null;
  tags: string[];
  currentUser: {
    username: string;
    firstName: string;
    lastName: string;
  } | null;
}

export const WizardStepReview: React.FC<WizardStepReviewProps> = ({
  images,
  title,
  description,
  externalUrl,
  normalizedUrl,
  tags,
  currentUser,
}) => {
  return (
    <div className="space-y-6">
      {/* Media Preview Section */}
      {images.length > 0 && (
        <div className="space-y-3">
          <span className="font-gothic text-xs font-bold uppercase tracking-wider text-[#87867f] block">
            Images &bull; {images.length} {images.length === 1 ? "Image" : "Images"}
          </span>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
            {/* Primary Hero Plate */}
            <div className="md:col-span-8 rounded-[20px] overflow-hidden bg-[#e6e3da] border border-[#cccbc8]/60 relative">
              <img
                src={images[0].url}
                alt="Primary cover image preview"
                className="w-full h-72 sm:h-80 object-cover"
              />
              <div className="absolute top-3 left-3 bg-[#141413]/80 backdrop-blur-xs text-[#faf9f5] px-3 py-1 rounded-full font-gothic text-[10px] font-bold uppercase tracking-wider">
                Primary Cover
              </div>
            </div>

            {/* Secondary Thumbnail Stack */}
            {images.length > 1 && (
              <div className="md:col-span-4 grid grid-cols-2 md:grid-cols-1 gap-3 max-h-80 overflow-y-auto pr-1">
                {images.slice(1).map((img, idx) => (
                  <div
                    key={img.id || idx}
                    className="rounded-xl overflow-hidden bg-[#e6e3da] border border-[#cccbc8]/60 relative h-24 sm:h-28"
                  >
                    <img
                      src={img.url}
                      alt={`Image ${idx + 2}`}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1.5 right-1.5 bg-[#141413]/70 text-[#faf9f5] px-1.5 py-0.5 rounded text-[9px] font-gothic uppercase">
                      Image {idx + 2}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Metadata & Statement Review Card */}
      <div className="bg-[#faf9f5] rounded-2xl sm:rounded-[24px] border border-[#cccbc8]/60 p-5 sm:p-7 lg:p-8 space-y-6 shadow-none">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-gothic text-[11px] font-bold uppercase tracking-wider text-[#87867f]">
              Project Title
            </span>
            {currentUser && (
              <>
                <span className="text-[#cccbc8]">&bull;</span>
                <span className="font-gothic text-[11px] text-[#87867f]">
                  By {currentUser.firstName} {currentUser.lastName} (@{currentUser.username})
                </span>
              </>
            )}
          </div>
          <h2 className="font-gothic text-xl sm:text-3xl font-extrabold uppercase tracking-tight text-[#141413] break-words">
            {title || "Untitled Project"}
          </h2>
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {tags.map((tag) => (
              <Badge key={tag} variant="stone" size="sm">
                #{tag}
              </Badge>
            ))}
          </div>
        )}

        <div className="pt-2 border-t border-[#cccbc8]/40">
          <span className="font-gothic text-[11px] font-bold uppercase tracking-wider text-[#87867f] block mb-2">
            Project Description
          </span>
          <p className="font-serif text-[15px] sm:text-[17px] text-[#141413]/90 leading-relaxed whitespace-pre-line break-words">
            {description || "No description provided."}
          </p>
        </div>

        {externalUrl && (
          <div className="pt-3 border-t border-[#cccbc8]/40 flex flex-wrap items-center gap-2 text-xs font-gothic uppercase tracking-wider text-[#141413]">
            <div className="flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-[#87867f]" />
              <span className="text-[#87867f]">Live Link:</span>
            </div>
            <a
              href={normalizedUrl || externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#d97757] hover:underline inline-flex items-center gap-1 font-semibold truncate max-w-[200px] sm:max-w-none"
            >
              <span className="truncate">{externalUrl}</span>
              <ExternalLink className="h-3 w-3 shrink-0" />
            </a>
          </div>
        )}
      </div>

      {/* Decision Guidance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
        <div className="p-4 rounded-2xl bg-[#faf9f5]/80 border border-[#cccbc8]/50 space-y-1">
          <div className="flex items-center gap-2 font-gothic text-xs font-bold uppercase tracking-wider text-[#141413]">
            <Save className="h-3.5 w-3.5 text-[#87867f]" />
            <span>Save as Draft</span>
          </div>
          <p className="font-serif text-xs text-[#87867f] leading-relaxed">
            Saves your project privately to your Studio workspace without publishing it.
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-[#faf9f5]/80 border border-[#cccbc8]/50 space-y-1">
          <div className="flex items-center gap-2 font-gothic text-xs font-bold uppercase tracking-wider text-[#d97757]">
            <Globe className="h-3.5 w-3.5 text-[#d97757]" />
            <span>Publish Work</span>
          </div>
          <p className="font-serif text-xs text-[#87867f] leading-relaxed">
            Publishes your project to the public feed and your profile.
          </p>
        </div>
      </div>
    </div>
  );
};
