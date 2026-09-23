import { ExternalLink, Globe } from "lucide-react";
import React from "react";

export interface PlatformIconProps {
  platform: string;
  className?: string;
}

/**
 * PlatformIcon: Crisp vector glyphs for major designer & developer social archives,
 * with fallback to a global web icon for custom links.
 */
export const PlatformIcon: React.FC<PlatformIconProps> = ({ platform, className = "h-4 w-4" }) => {
  switch (platform.trim().toLowerCase()) {
    case "github":
      return (
        <svg
          className={className}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
          <path d="M9 18c-4.51 2-5-2-7-2" />
        </svg>
      );
    case "linkedin":
      return (
        <svg
          className={className}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
          <rect x="2" y="9" width="4" height="12" />
          <circle cx="4" cy="4" r="2" />
        </svg>
      );
    case "behance":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M7.79 13.53c-.45 0-.91-.02-1.37-.02v2.85c.44.03.88.04 1.32.04 1.45 0 2.45-.63 2.45-1.46 0-.89-.92-1.41-2.4-1.41zm-.05-4.47c-.43 0-.87.02-1.32.02v2.42c.43.02.86.03 1.28.03 1.28 0 2.16-.54 2.16-1.28 0-.74-.82-1.19-2.12-1.19zm8.12 3.86h3.42c-.08-.94-.8-1.54-1.74-1.54-.92 0-1.63.59-1.68 1.54zm5.95 2.12c-.51 1.76-2.14 2.94-4.29 2.94-2.73 0-4.63-1.89-4.63-4.59s1.95-4.68 4.67-4.68c2.81 0 4.54 1.94 4.54 4.67 0 .34-.04.66-.09.95h-6.4c.09 1.21.94 1.99 2.05 1.99 1.05 0 1.69-.5 1.96-1.28h2.19zm-3.8-5.38h3.04v-1.07h-3.04v1.07zm-7.65.65c1.47 0 2.53.51 3.19 1.48.51.75.7 1.69.58 2.65-.24 2.01-1.99 3.13-4.14 3.13H3.6V6.62h5.59c1.93 0 3.51.98 3.51 2.82 0 1.03-.57 1.84-1.54 2.25z" />
        </svg>
      );
    case "dribbble":
      return (
        <svg
          className={className}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M19.13 5.09C15.22 9.14 10 10.44 2.25 10.94" />
          <path d="M21.75 12.84c-6.62-1.41-12.14 1-16.38 6.32" />
          <path d="M8.56 2.75c4.37 6 6 9.42 8 17.72" />
        </svg>
      );
    case "x":
    case "twitter":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    case "instagram":
      return (
        <svg
          className={className}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
      );
    case "website":
      return <Globe className={className} aria-hidden="true" />;
    default:
      return <ExternalLink className={className} aria-hidden="true" />;
  }
};
