import { PostStatus, type PostStatus as PostStatusType } from "@shared/types/index.ts";

/**
 * Robustly normalizes post status from any numeric, string, or enum representation
 * into a canonical numeric PostStatus enum value.
 */
export function normalizePostStatus(status: unknown): PostStatusType {
  if (typeof status === "number") {
    if (status === PostStatus.Published) return PostStatus.Published;
    if (status === PostStatus.Unpublished) return PostStatus.Unpublished;
    return PostStatus.Draft;
  }

  if (typeof status === "string") {
    const s = status.trim().toLowerCase();
    if (s === "published" || s === "1") return PostStatus.Published;
    if (s === "unpublished" || s === "2") return PostStatus.Unpublished;
    return PostStatus.Draft;
  }

  return PostStatus.Draft;
}

export function isPostPublished(status: unknown): boolean {
  return normalizePostStatus(status) === PostStatus.Published;
}

export function isPostDraft(status: unknown): boolean {
  const normalized = normalizePostStatus(status);
  return normalized === PostStatus.Draft || normalized === PostStatus.Unpublished;
}
