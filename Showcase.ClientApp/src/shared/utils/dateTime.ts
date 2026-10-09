export interface FormatRelativeTimeOptions {
  suffix?: boolean;
}

/**
 * Formats an ISO date string into a relative time string (e.g., 'just now', '5m ago', '2h ago', '3d ago', '2w ago').
 * Compatible with notification timestamps and curatorial post metadata.
 */
export function formatRelativeTime(
  dateString?: string | null,
  options: FormatRelativeTimeOptions = {}
): string {
  if (!dateString) return "";

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";

  const now = new Date();
  const diffInSeconds = Math.max(0, Math.floor((now.getTime() - date.getTime()) / 1000));
  const { suffix = false } = options;

  if (diffInSeconds < 60) {
    return "just now";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return suffix ? `${diffInMinutes}m ago` : `${diffInMinutes}m`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return suffix ? `${diffInHours}h ago` : `${diffInHours}h`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return suffix ? `${diffInDays}d ago` : `${diffInDays}d`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return suffix ? `${diffInWeeks}w ago` : `${diffInWeeks}w`;
  }

  // Fallback to formatted date for older items
  const isCurrentYear = date.getFullYear() === now.getFullYear();
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    ...(isCurrentYear ? {} : { year: "numeric" }),
  });
}
