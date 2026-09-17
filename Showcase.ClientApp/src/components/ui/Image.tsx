import React, { useState } from "react";

export interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  aspectRatio?: "square" | "video" | "wide" | "auto";
  rounded?: "none" | "sm" | "md" | "lg" | "full";
}

export const Image: React.FC<ImageProps> = ({
  src,
  alt = "",
  fallbackSrc = "https://placehold.co/600x400?text=No+Image",
  aspectRatio = "auto",
  rounded = "md",
  className = "",
  ...props
}) => {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const aspectStyles: Record<string, string> = {
    square: "aspect-square object-cover",
    video: "aspect-video object-cover",
    wide: "aspect-[21/9] object-cover",
    auto: "h-auto object-cover",
  };

  const roundedStyles: Record<string, string> = {
    none: "rounded-none",
    sm: "rounded-sm",
    md: "rounded-lg",
    lg: "rounded-xl",
    full: "rounded-full",
  };

  return (
    <div className={`relative overflow-hidden ${roundedStyles[rounded]} bg-slate-100 dark:bg-slate-800`}>
      {loading && <div className="absolute inset-0 animate-pulse bg-slate-200 dark:bg-slate-700" />}
      <img
        src={error || !src ? fallbackSrc : src}
        alt={alt}
        onLoad={() => setLoading(false)}
        onError={() => {
          setError(true);
          setLoading(false);
        }}
        className={`w-full transition-opacity duration-300 ${loading ? "opacity-0" : "opacity-100"} ${aspectStyles[aspectRatio]} ${className}`}
        {...props}
      />
    </div>
  );
};
