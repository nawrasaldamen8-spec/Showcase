import React, { useState } from "react";
import { Image as ImageIcon } from "lucide-react";
import { getOptimizedImageUrl, type ImageVariant } from "../utils/mediaUrl.ts";

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
  fallbackIconClassName = "w-6 h-6 text-cloud-dark/50",
  priority = false,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const optimizedSrc = getOptimizedImageUrl(src, variant);
  const blurPlaceholderSrc = getOptimizedImageUrl(src, "blur");

  return (
    <div
      className={`relative overflow-hidden bg-[#e8e5dc] ${aspectRatioClassName} ${containerClassName}`.trim()}
    >
      {/* Background Micro Blur Placeholder & Skeleton Shimmer (visible while loading) */}
      {!isLoaded && !hasError && (
        <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none">
          {blurPlaceholderSrc && blurPlaceholderSrc !== optimizedSrc ? (
            <img
              src={blurPlaceholderSrc}
              alt=""
              aria-hidden="true"
              className="w-full h-full object-cover filter blur-md scale-110 opacity-70 transition-opacity duration-300"
            />
          ) : (
            <div className="w-full h-full bg-[#e4e1d7] animate-pulse" />
          )}
        </div>
      )}

      {/* Actual Responsive Image with Blur-Up Transition */}
      {!hasError && optimizedSrc ? (
        <img
          src={optimizedSrc}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`w-full h-full object-cover transition-all duration-500 ease-out ${
            isLoaded
              ? "opacity-100 blur-0 scale-100"
              : "opacity-0 blur-sm scale-[1.02]"
          } ${className}`.trim()}
          {...props}
        />
      ) : (
        /* Error Fallback State */
        <div className="absolute inset-0 flex items-center justify-center bg-ivory-medium text-cloud-dark">
          <ImageIcon className={fallbackIconClassName} />
        </div>
      )}
    </div>
  );
};
