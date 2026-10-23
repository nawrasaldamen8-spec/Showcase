import { httpFetch } from "@shared/api/apiClient.base.ts";

export const apiAnalyticsClient = {
  async trackProfileVisit(profileId: string, visitorToken?: string): Promise<void> {
    return httpFetch<void>("/api/analytics/visit", {
      method: "POST",
      body: JSON.stringify({ profileId, visitorToken }),
      requiresAuth: false,
    });
  },
};
