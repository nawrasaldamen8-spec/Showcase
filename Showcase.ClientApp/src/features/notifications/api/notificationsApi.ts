import type { PaginatedList } from "@shared/types/index.ts";
import { httpFetch } from "@shared/api/apiClient.base.ts";

export interface NotificationDto {
  id: string;
  type: string;
  title: string;
  message: string;
  sourcePostId?: string | null;
  sourceUserId?: string | null;
  actorUsername?: string | null;
  actorName?: string | null;
  actorAvatarUrl?: string | null;
  postTitle?: string | null;
  postCoverUrl?: string | null;
  isRead: boolean;
  createdAtUtc: string;
}

export const apiNotificationsClient = {
  async getNotifications(pageNumber = 1, pageSize = 20): Promise<PaginatedList<NotificationDto>> {
    return httpFetch<PaginatedList<NotificationDto>>(
      `/api/notifications?pageNumber=${pageNumber}&pageSize=${pageSize}`
    );
  },

  async markNotificationAsRead(id: string): Promise<void> {
    return httpFetch<void>(`/api/notifications/${id}/read`, {
      method: "PUT",
    });
  },

  async markAllNotificationsAsRead(): Promise<void> {
    return httpFetch<void>("/api/notifications/read-all", {
      method: "PUT",
    });
  },

  async deleteNotification(id: string): Promise<void> {
    return httpFetch<void>(`/api/notifications/${id}`, {
      method: "DELETE",
    });
  },

  async getUnreadNotificationsCount(): Promise<{ count: number }> {
    return httpFetch<{ count: number }>("/api/notifications/unread-count");
  },
};
