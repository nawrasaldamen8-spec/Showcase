import React, { useState } from "react";
import { Image as ImageIcon } from "lucide-react";

export interface ProgressiveImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  containerClassName?: string;
  aspectRatioClassName?: string;
  fallbackIconClassName?: string;
  priority?: boolean;
}

/**
 * Modern Progressive Blur-Up Image Component.
 * Prevents Layout Shifts (CLS), shows a smooth skeleton shimmer placeholder,
 * and transitions from blur to crisp sharp focus when loaded.
 */
export const ProgressiveImage: React.FC<ProgressiveImageProps> = ({
  src,
  alt,
  className = "",
  containerClassName = "",
  aspectRatioClassName = "",
  fallbackIconClassName = "w-6 h-6 text-cloud-dark/50",
  priority = false,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div
      className={`relative overflow-hidden bg-[#e8e5dc] ${aspectRatioClassName} ${containerClassName}`.trim()}
    >
      {/* Shimmer / Skeleton Placeholder (visible while loading) */}
      {!isLoaded && !hasError && (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[#e4e1d7] animate-pulse pointer-events-none"
        />
      )}

      {/* Actual Image with Blur-Up Transition */}
      {!hasError ? (
        <img
          src={src}
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
