import { apiAdminClient } from "./apiClient.admin.ts";
import { apiAuthClient } from "./apiClient.auth.ts";
import { apiCareerClient } from "./apiClient.career.ts";
import { apiPostsClient } from "./apiClient.posts.ts";
import { apiProfileClient } from "./apiClient.profile.ts";

export { API_BASE_URL, httpFetch, USE_MOCK_API } from "./apiClient.base.ts";
export type { FetchOptions } from "./apiClient.base.ts";

export const apiClient = {
  ...apiAuthClient,
  ...apiProfileClient,
  ...apiPostsClient,
  ...apiCareerClient,
  ...apiAdminClient,
};
