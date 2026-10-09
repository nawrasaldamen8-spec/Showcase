import { httpFetch } from "@shared/api/apiClient.base.ts";

export interface ProfileAnalyticsDto {
  totalViews: number;
  uniqueVisitors: number;
  totalLikes: number;
  totalPosts: number;
}

export const apiAnalyticsClient = {
  async trackProfileVisit(profileId: string, visitorToken?: string): Promise<void> {
    return httpFetch<void>("/api/analytics/visit", {
      method: "POST",
      body: JSON.stringify({ profileId, visitorToken }),
      requiresAuth: false,
    });
  },

  async getProfileAnalytics(): Promise<ProfileAnalyticsDto> {
    return httpFetch<ProfileAnalyticsDto>("/api/analytics/profile");
  },
};
