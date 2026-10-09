import React, { useState } from "react";
import { Image as ImageIcon } from "lucide-react";
import { getOptimizedImageUrl, type ImageVariant } from "@shared/utils/mediaUrl.ts";

export interface ProgressiveImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  variant?: ImageVariant;
  containerClassName?: string;
  aspectRatioClassName?: string;
  fallbackIconClassName?: string;
  priority?: boolean;
}

/**
 * Modern Progressive Blur-Up Responsive Image Component.
 * - Serves bandwidth-optimized responsive WebP/AVIF variants from CDN.
 * - Prevents Layout Shifts (CLS) with skeleton shimmer and ultra-light blurred micro-placeholder.
 * - Hardware-accelerated smooth transition from blur to crisp focus on load.
 */
export const ProgressiveImage: React.FC<ProgressiveImageProps> = ({
  src,
  alt,
  variant = "feed",
  className = "",
  containerClassName = "",
  aspectRatioClassName = "",
  fallbackIconClassName = "w-8 h-8 text-cloud-dark/40",
  priority = false,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Derive responsive srcset and fallback URLs
  const optimizedSrc = getOptimizedImageUrl(src, variant);
  const microPlaceholderSrc = getOptimizedImageUrl(src, "blur");

  return (
    <div
      className={`relative overflow-hidden bg-ivory-medium/60 ${containerClassName} ${aspectRatioClassName}`}
    >
      {/* 1. Loading Skeleton / Shimmer Background */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gradient-to-r from-ivory-medium/40 via-ivory-light/60 to-ivory-medium/40 animate-pulse" />
      )}

      {/* 2. Micro-blurred LQIP Placeholder (renders immediately) */}
      {!isLoaded && !hasError && (
        <img
          src={microPlaceholderSrc}
          alt=""
          aria-hidden="true"
          className={`absolute inset-0 w-full h-full object-cover filter blur-md scale-105 transition-opacity duration-300 pointer-events-none ${
            isLoaded ? "opacity-0" : "opacity-70"
          }`}
        />
      )}

      {/* 3. Hi-Res Primary Image */}
      {!hasError ? (
        <img
          src={optimizedSrc}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`w-full h-full object-cover transition-all duration-300 ease-out will-change-transform ${
            isLoaded ? "opacity-100 filter-none" : "opacity-0 filter blur-sm"
          } ${className}`}
          {...props}
        />
      ) : (
        /* 4. Elegant Broken Image Fallback */
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-ivory-medium/40 text-center">
          <ImageIcon className={fallbackIconClassName} />
        </div>
      )}
    </div>
  );
};
