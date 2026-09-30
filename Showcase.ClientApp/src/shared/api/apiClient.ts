import { apiAdminClient } from "./apiClient.admin.ts";
import { apiAnalyticsClient } from "./apiClient.analytics.ts";
import { apiAuthClient } from "./apiClient.auth.ts";
import { apiCareerClient } from "./apiClient.career.ts";
import { apiLookupsClient } from "./apiClient.lookups.ts";
import { apiNotificationsClient } from "./apiClient.notifications.ts";
import { apiPostsClient } from "./apiClient.posts.ts";
import { apiProfileClient } from "./apiClient.profile.ts";

export { API_BASE_URL, httpFetch, USE_MOCK_API } from "./apiClient.base.ts";
export type { FetchOptions } from "./apiClient.base.ts";
export { apiNotificationsClient, apiLookupsClient, apiAnalyticsClient };

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
