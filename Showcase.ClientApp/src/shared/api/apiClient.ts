import { apiAdminClient } from "@features/admin/api/index.ts";
import { apiAuthClient } from "@features/auth/api/index.ts";
import { apiCareerClient } from "@features/career/api/index.ts";
import { apiNotificationsClient } from "@features/notifications/api/index.ts";
import { apiAnalyticsClient, apiPostsClient } from "@features/posts/api/index.ts";
import { apiProfileClient } from "@features/profile/api/index.ts";
import { apiLookupsClient } from "./apiClient.lookups.ts";

export { API_BASE_URL, httpFetch, USE_MOCK_API } from "./apiClient.base.ts";
export type { FetchOptions } from "./apiClient.base.ts";
export {
  apiAdminClient,
  apiAnalyticsClient,
  apiAuthClient,
  apiCareerClient,
  apiLookupsClient,
  apiNotificationsClient,
  apiPostsClient,
  apiProfileClient,
};

export const apiClient = {
  ...apiAuthClient,
  ...apiProfileClient,
  ...apiPostsClient,
  ...apiCareerClient,
  ...apiAdminClient,
  ...apiNotificationsClient,
  ...apiLookupsClient,
  ...apiAnalyticsClient,
};
