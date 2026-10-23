import { ZoomIn } from "lucide-react";
import React, { useState } from "react";
import { Lightbox, type LightboxImageItem } from "@shared/components/Lightbox.tsx";

export interface PostHorizontalGalleryProps {
  images?: Array<LightboxImageItem | string> | null;
  className?: string;
  title?: string;
}

export const PostHorizontalGallery: React.FC<PostHorizontalGalleryProps> = ({
  images,
  className = "",
  title = "Project plate",
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const normalizedImages: LightboxImageItem[] = (images || [])
    .filter(Boolean)
    .map((item) =>
      typeof item === "string" ? { url: item, alt: title } : { url: item.url, alt: item.alt || title }
    );

  if (normalizedImages.length === 0 || !normalizedImages[0]) {
    return null;
  }

  const firstImage = normalizedImages[0];

  return (
    <>
      <div className={`w-full my-4 ${className}`}>
        {normalizedImages.length === 1 ? (
          <div
            role="button"
            tabIndex={0}
            onClick={() => setSelectedIndex(0)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setSelectedIndex(0);
              }
            }}
            className="group relative w-full rounded-2xl overflow-hidden bg-[#e6e3da] border border-stone/80 hover:border-slate-dark/40 transition-all cursor-pointer shadow-2xs flex items-center justify-center max-h-[460px]"
            title="Click to inspect full image"
          >
            <img
              src={firstImage.url}
              alt={firstImage.alt || title}
              className="max-h-[460px] w-auto max-w-full object-contain mx-auto transition-transform duration-300 group-hover:scale-[1.01]"
              loading="lazy"
              decoding="async"
            />
            {/* Hover Zoom Hint */}
            <div className="absolute inset-0 bg-slate-dark/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
              <span className="px-3.5 py-1.5 rounded-full bg-slate-dark/85 text-ivory-light shadow-sm flex items-center gap-1.5 text-xs font-gothic uppercase tracking-wider font-semibold">
                <ZoomIn className="w-3.5 h-3.5" />
                <span>Inspect plate</span>
              </span>
            </div>
          </div>
        ) : (
          <div
            className={`grid ${
              normalizedImages.length === 2 ? "grid-cols-2 gap-3" : "grid-cols-3 gap-2.5"
            }`}
          >
            {normalizedImages.map((img, idx) => (
              <div
                key={img.url + idx}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedIndex(idx)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedIndex(idx);
                  }
                }}
                className={`group relative ${
                  normalizedImages.length === 2 ? "h-48 sm:h-64" : "h-36 sm:h-52"
                } w-full rounded-xl overflow-hidden bg-[#e6e3da] border border-stone/80 hover:border-slate-dark/50 transition-all cursor-pointer shadow-xs focus:outline-none focus:ring-2 focus:ring-slate-dark`}
                title="Click to inspect plate"
              >
                <img
                  src={img.url}
                  alt={img.alt || `${title} - Image ${idx + 1}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                  decoding="async"
                />

                {/* Hover Zoom Hint */}
                <div className="absolute inset-0 bg-slate-dark/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                  <span className="p-2 rounded-full bg-slate-dark/80 text-ivory-light shadow-sm flex items-center gap-1 text-xs">
                    <ZoomIn className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedIndex !== null && (
        <Lightbox
          images={normalizedImages}
          initialIndex={selectedIndex}
          onClose={() => setSelectedIndex(null)}
          onIndexChange={(newIdx) => setSelectedIndex(newIdx)}
        />
      )}
    </>
  );
};
