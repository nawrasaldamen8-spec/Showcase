import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient, extractApiErrorMessage, queryKeys, tokenStorage } from "@shared/api/index.ts";
import type { NotificationDto } from "@shared/api/apiClient.notifications.ts";

export function useNotificationsQuery(limit = 50, options?: { enabled?: boolean }) {
  return useQuery<NotificationDto[]>({
    queryKey: queryKeys.notifications.list(limit),
    queryFn: () => apiClient.getNotifications(limit),
    enabled: options?.enabled ?? Boolean(tokenStorage.getToken()),
    staleTime: 1000 * 30, // 30 seconds
  });
}

export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.markNotificationAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
    onError: (err) => {
      toast.error(extractApiErrorMessage(err, "Failed to mark notification as read."));
    },
  });
}

export function useMarkAllNotificationsReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiClient.markAllNotificationsAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
      toast.success("All notifications marked as read.");
    },
    onError: (err) => {
      toast.error(extractApiErrorMessage(err, "Failed to mark all as read."));
    },
  });
}

export function useDeleteNotificationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
      toast.success("Notification deleted.");
    },
    onError: (err) => {
      toast.error(extractApiErrorMessage(err, "Failed to delete notification."));
    },
  });
}
