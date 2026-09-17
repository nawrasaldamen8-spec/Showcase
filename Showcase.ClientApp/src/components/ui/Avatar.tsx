import React, { useState } from "react";

export interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ src, alt, name, size = "md", className = "" }) => {
  const [hasError, setHasError] = useState(false);

  const sizeStyles: Record<string, string> = {
    xs: "w-6 h-6 text-[10px]",
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-16 h-16 text-lg font-semibold",
    xl: "w-24 h-24 text-2xl font-bold",
  };

  const getInitials = (str?: string) => {
    if (!str) return "?";
    const parts = str.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return str.slice(0, 2).toUpperCase();
  };

  return (
    <div
      className={`relative inline-flex shrink-0 items-center justify-center rounded-full overflow-hidden bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-medium select-none shadow-inner ${sizeStyles[size]} ${className}`}
    >
      {src && !hasError ? (
        <img
          src={src}
          alt={alt || name || "Avatar"}
          onError={() => setHasError(true)}
          className="w-full h-full object-cover"
        />
      ) : (
        <span>{getInitials(name || alt)}</span>
      )}
    </div>
  );
};
