import { ExternalLink, Globe } from "lucide-react";
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
    name: string;
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
      {images.length > 0 && images[0] && (
        <div className="space-y-3">
          <span className="font-gothic text-xs font-bold uppercase tracking-wider text-cloud-dark block">
            Images &bull; {images.length} {images.length === 1 ? "Image" : "Images"}
          </span>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
            {/* Primary Hero Plate */}
            <div className="md:col-span-8 rounded-[20px] overflow-hidden bg-[#e6e3da] border border-stone/60 relative">
              <img
                src={images[0].url}
                alt="Primary cover image preview"
                className="w-full h-72 sm:h-80 object-cover"
              />
              <div className="absolute top-3 left-3 bg-slate-dark/80 backdrop-blur-xs text-ivory-light px-3 py-1 rounded-full font-gothic text-[10px] font-bold uppercase tracking-wider">
                Primary Cover
              </div>
            </div>

            {/* Secondary Thumbnail Stack */}
            {images.length > 1 && (
              <div className="md:col-span-4 grid grid-cols-2 md:grid-cols-1 gap-3 max-h-80 overflow-y-auto pr-1">
                {images.slice(1).map((img, idx) => (
                  <div
                    key={img.id || idx}
                    className="rounded-xl overflow-hidden bg-[#e6e3da] border border-stone/60 relative h-24 sm:h-28"
                  >
                    <img
                      src={img.url}
                      alt={`Image ${idx + 2}`}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1.5 right-1.5 bg-slate-dark/70 text-ivory-light px-1.5 py-0.5 rounded text-[9px] font-gothic uppercase">
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
      <div className="bg-ivory-light rounded-2xl sm:rounded-card border border-stone/60 p-5 sm:p-7 lg:p-8 space-y-6 shadow-none">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-gothic text-[11px] font-bold uppercase tracking-wider text-cloud-dark">
              Project Title
            </span>
            {currentUser && (
              <>
                <span className="text-stone">&bull;</span>
                <span className="font-gothic text-[11px] text-cloud-dark">
                  By {currentUser.name} (@{currentUser.username})
                </span>
              </>
            )}
          </div>
          <h2 className="font-gothic text-xl sm:text-3xl font-extrabold uppercase tracking-tight text-slate-dark break-words">
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

        <div className="pt-2 border-t border-stone/40">
          <span className="font-gothic text-[11px] font-bold uppercase tracking-wider text-cloud-dark block mb-2">
            Project Description
          </span>
          <p className="font-serif text-[15px] sm:text-[17px] text-slate-dark/90 leading-relaxed whitespace-pre-line break-words">
            {description || "No description provided."}
          </p>
        </div>

        {externalUrl && (
          <div className="pt-3 border-t border-stone/40 flex flex-wrap items-center gap-2 text-xs font-gothic uppercase tracking-wider text-slate-dark">
            <div className="flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-cloud-dark" />
              <span className="text-cloud-dark">Live Link:</span>
            </div>
            <a
              href={normalizedUrl || externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-clay hover:underline inline-flex items-center gap-1 font-semibold truncate max-w-[200px] sm:max-w-none"
            >
              <span className="truncate">{externalUrl}</span>
              <ExternalLink className="h-3 w-3 shrink-0" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
