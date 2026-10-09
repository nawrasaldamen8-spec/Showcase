import React, { useState } from "react";
import { User as UserIcon } from "lucide-react";
import { getOptimizedImageUrl, type ImageVariant } from "@shared/utils/mediaUrl.ts";

export type UserAvatarSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "hero";

export interface UserAvatarProps {
  src?: string | null;
  alt?: string;
  size?: UserAvatarSize;
  variant?: ImageVariant;
  className?: string;
  iconClassName?: string;
  imgClassName?: string;
  loading?: "lazy" | "eager";
  fetchPriority?: "high" | "low" | "auto";
}

const sizeClasses: Record<UserAvatarSize, { container: string; icon: string }> = {
  xs: {
    container: "h-6 w-6",
    icon: "h-3.5 w-3.5",
  },
  sm: {
    container: "h-8 w-8",
    icon: "h-4 w-4",
  },
  md: {
    container: "h-10 w-10",
    icon: "h-5 w-5",
  },
  lg: {
    container: "h-14 w-14",
    icon: "h-7 w-7",
  },
  xl: {
    container: "h-16 w-16 sm:h-20 sm:w-20",
    icon: "h-8 w-8 sm:h-10 sm:w-10",
  },
  "2xl": {
    container: "h-24 w-24 sm:h-28 sm:w-28",
    icon: "h-12 w-12 sm:h-14 sm:w-14",
  },
  hero: {
    container: "h-28 w-28 sm:h-32 sm:w-32",
    icon: "h-14 w-14 sm:h-16 sm:w-16",
  },
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  src,
  alt = "User avatar",
  size = "md",
  variant = "avatar",
  className = "",
  iconClassName = "",
  imgClassName = "",
  loading = "lazy",
  fetchPriority = "auto",
}) => {
  const [hasError, setHasError] = useState(false);
  const config = sizeClasses[size];
  const hasImage = Boolean(src && !hasError && src.trim() !== "");

  if (hasImage && src) {
    return (
      <div
        className={`relative rounded-full overflow-hidden shrink-0 select-none bg-[#F0EEE6] ${config.container} ${className}`}
      >
        <img
          src={getOptimizedImageUrl(src, variant)}
          alt={alt}
          loading={loading}
          fetchPriority={fetchPriority}
          decoding="async"
          onError={() => setHasError(true)}
          className={`w-full h-full object-cover ${imgClassName}`}
        />
      </div>
    );
  }

  return (
    <div
      className={`relative rounded-full overflow-hidden shrink-0 select-none flex items-center justify-center bg-[#F0EEE6] ${config.container} ${className}`}
      aria-label={alt}
    >
      <UserIcon
        className={`stroke-[#D97757] fill-none stroke-[1.75] ${config.icon} ${iconClassName}`}
        aria-hidden="true"
      />
    </div>
  );
};
