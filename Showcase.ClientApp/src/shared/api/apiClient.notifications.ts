import { httpFetch } from "./apiClient.base.ts";

export interface NotificationDto {
  id: string;
  type: string;
  title: string;
  message: string;
  sourcePostId?: string | null;
  sourceUserId?: string | null;
  isRead: boolean;
  createdAtUtc: string;
}

export const apiNotificationsClient = {
  async getNotifications(limit = 50): Promise<NotificationDto[]> {
    return httpFetch<NotificationDto[]>(`/api/notifications?limit=${limit}`);
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
};
