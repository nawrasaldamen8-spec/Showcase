# Changelog: Fix Studio 400 Bad Request on GetMyPosts

**Date:** 2026-09-30  
**Topic:** Studio Dashboard Posts Loading & PageSize Validation Fix

## Problem
When loading `StudioDashboardPage.tsx`, the request `GET /api/posts/mine?pageNumber=1&pageSize=100` failed with `400 Bad Request`.
Root cause: `GetMyPostsQueryValidator.cs` restricted `PageSize` with `.InclusiveBetween(1, 50)`. Sending `pageSize=100` triggered a FluentValidation failure.

## Solution
1. In `src/features/posts/pages/StudioDashboardPage.tsx`, adjusted `loadPosts` to pass `pageSize: 50` and wrapped error reporting with `extractApiErrorMessage`.
2. In `src/shared/api/apiClient.posts.ts`, aligned default `pageSize = 50` for `getMyPosts`.
3. In `Showcase.Application/Features/Posts/Queries/GetMyPosts/GetMyPostsQueryValidator.cs`, `GetExplorePostsQueryValidator.cs`, and `GetProfilePostsQueryValidator.cs`, expanded the allowed `PageSize` upper bound to 100 for greater backend query flexibility.

## Verification
- `Showcase.Application` built successfully (0 Errors, 0 Warnings).
- `Showcase.ClientApp` built production bundle successfully (0 Errors).
