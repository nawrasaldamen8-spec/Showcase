import { Maximize2 } from "lucide-react";
import React, { useMemo } from "react";
import { ProgressiveImage } from "@shared/components/ProgressiveImage.tsx";
import type { PostDetailsResponse } from "@shared/types/index.ts";
import { PostCuratorialMeta } from "./PostCuratorialMeta.tsx";

export interface PostDetailDesktopProps {
  post: PostDetailsResponse;
  creatorName: string;
  creatorUsername: string;
  creatorAvatar?: string;
  onInspectImage: (index: number) => void;
}

interface PlateLayoutConfig {
  gridSpan: string;
  aspectRatioClass: string;
}

function getPlateLayoutConfig(secIndex: number, secondaryCount: number): PlateLayoutConfig {
  if (secondaryCount === 1) {
    return {
      gridSpan: "col-span-12",
      aspectRatioClass: "aspect-[16/10] max-h-[650px]",
    };
  }

  if (secondaryCount === 2) {
    if (secIndex === 0) {
      return {
        gridSpan: "col-span-12 md:col-span-5",
        aspectRatioClass: "aspect-[3/4] max-h-[550px]",
      };
    }
    return {
      gridSpan: "col-span-12 md:col-span-7",
      aspectRatioClass: "aspect-[4/3] max-h-[550px]",
    };
  }

  if (secondaryCount === 3) {
    if (secIndex === 0) {
      return {
        gridSpan: "col-span-12 md:col-span-7",
        aspectRatioClass: "aspect-[4/3] max-h-[500px]",
      };
    }
    if (secIndex === 1) {
      return {
        gridSpan: "col-span-12 md:col-span-5",
        aspectRatioClass: "aspect-[3/4] max-h-[500px]",
      };
    }
    return {
      gridSpan: "col-span-12",
      aspectRatioClass: "aspect-[16/9] lg:aspect-[21/9] max-h-[550px]",
    };
  }

  if (secondaryCount === 4) {
    if (secIndex === 0) {
      return {
        gridSpan: "col-span-12 md:col-span-5",
        aspectRatioClass: "aspect-[3/4] max-h-[500px]",
      };
    }
    if (secIndex === 1) {
      return {
        gridSpan: "col-span-12 md:col-span-7",
        aspectRatioClass: "aspect-[4/3] max-h-[500px]",
      };
    }
    return {
      gridSpan: "col-span-12 md:col-span-6",
      aspectRatioClass: "aspect-[4/3] max-h-[480px]",
    };
  }

  // 5+ items: alternating editorial mosaic rhythm
  const patternIndex = secIndex % 5;
  const isLastSingle = secIndex === secondaryCount - 1 && secIndex % 2 === 0;

  if (isLastSingle && patternIndex !== 2) {
    return {
      gridSpan: "col-span-12",
      aspectRatioClass: "aspect-[16/9] lg:aspect-[21/9] max-h-[550px]",
    };
  }

  switch (patternIndex) {
    case 0:
      return {
        gridSpan: "col-span-12 md:col-span-5",
        aspectRatioClass: "aspect-[3/4] max-h-[520px]",
      };
    case 1:
      return {
        gridSpan: "col-span-12 md:col-span-7",
        aspectRatioClass: "aspect-[4/3] max-h-[520px]",
      };
    case 2:
      return {
        gridSpan: "col-span-12",
        aspectRatioClass: "aspect-[16/9] lg:aspect-[21/9] max-h-[550px]",
      };
    case 3:
    case 4:
    default:
      return {
        gridSpan: "col-span-12 md:col-span-6",
        aspectRatioClass: "aspect-square sm:aspect-[4/3] max-h-[480px]",
      };
  }
}

export const PostDetailDesktop: React.FC<PostDetailDesktopProps> = ({
  post,
  creatorName,
  creatorUsername,
  creatorAvatar,
  onInspectImage,
}) => {
  const images = post.images || [];
  const primaryImage = images[0];
  const secondaryImages = images.slice(1);

  const secondaryLayouts = useMemo(() => {
    return secondaryImages.map((_, i) => getPlateLayoutConfig(i, secondaryImages.length));
  }, [secondaryImages]);

  return (
    <div className="space-y-12 lg:space-y-16">
      {/* Main Project Header Section */}
      <section
        aria-label="Project images"
        className="grid grid-cols-12 gap-8 lg:gap-12 xl:gap-16 items-start"
      >
        {/* Primary Cover Plate */}
        <div className="col-span-12 lg:col-span-7">
          {primaryImage ? (
            <figure
              className="group relative rounded-card overflow-hidden bg-[#e6e3da] border border-stone/60 cursor-pointer shadow-none transition-all duration-300 hover:border-slate-dark/40"
              onClick={() => onInspectImage(0)}
            >
              <ProgressiveImage
                src={primaryImage.url}
                alt={post.title}
                variant="detail"
                priority
                containerClassName="w-full max-h-[75vh]"
                className="w-full h-auto max-h-[75vh] object-cover transition-transform duration-700 ease-out group-hover:scale-[1.01]"
              />
              <div className="absolute top-4 right-4 bg-slate-dark/75 backdrop-blur-xs text-ivory-light px-3 py-1.5 rounded-full font-gothic text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <Maximize2 className="h-3.5 w-3.5" />
                <span>Inspect</span>
              </div>
            </figure>
          ) : (
            <div className="w-full h-[55vh] rounded-card bg-[#e6e3da] border border-stone/60 flex items-center justify-center font-serif text-cloud-dark">
              No media available
            </div>
          )}
        </div>

        {/* Sticky Curatorial Metadata Sidebar */}
        <div className="col-span-12 lg:col-span-5 lg:sticky lg:top-24">
          <PostCuratorialMeta
            post={post}
            creatorName={creatorName}
            creatorUsername={creatorUsername}
            creatorAvatar={creatorAvatar}
            layout="sidebar"
          />
        </div>
      </section>

      {/* Additional Images Section */}
      {secondaryImages.length > 0 && (
        <section aria-label="Additional project images" className="pt-10 sm:pt-14 border-t border-stone/50 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-stretch">
            {secondaryImages.map((image, idx) => {
              const layout = secondaryLayouts[idx] ?? { gridSpan: "col-span-12", aspectRatioClass: "aspect-[16/9]" };
              const overallIndex = idx + 1;
              return (
                <figure
                  key={image.id || idx}
                  className={`group relative rounded-card overflow-hidden bg-[#e6e3da] border border-stone/50 cursor-pointer shadow-none transition-all duration-300 hover:border-slate-dark/40 ${layout.gridSpan}`}
                  onClick={() => onInspectImage(overallIndex)}
                >
                  <div className={`relative ${layout.aspectRatioClass} w-full overflow-hidden`}>
                    <ProgressiveImage
                      src={image.url}
                      alt={`${post.title} - Image ${overallIndex + 1}`}
                      variant="detail"
                      containerClassName="w-full h-full"
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.01]"
                    />
                    <div className="absolute top-4 right-4 bg-slate-dark/75 backdrop-blur-xs text-ivory-light px-3 py-1.5 rounded-full font-gothic text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Maximize2 className="h-3.5 w-3.5" />
                      <span>Inspect</span>
                    </div>
                  </div>
                </figure>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};
