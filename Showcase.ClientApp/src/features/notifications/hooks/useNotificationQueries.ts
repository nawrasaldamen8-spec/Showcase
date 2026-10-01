import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient, extractApiErrorMessage, queryKeys, tokenStorage } from "@shared/api/index.ts";
import type { NotificationDto } from "@shared/api/apiClient.notifications.ts";
import type { PaginatedList } from "@shared/types/index.ts";

export function useInfiniteNotificationsQuery(pageSize = 20, options?: { enabled?: boolean }) {
  return useInfiniteQuery<PaginatedList<NotificationDto>>({
    queryKey: queryKeys.notifications.infinite(pageSize),
    queryFn: ({ pageParam = 1 }) =>
      apiClient.getNotifications(pageParam as number, pageSize),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.pageNumber + 1 : undefined,
    enabled: options?.enabled ?? Boolean(tokenStorage.getToken()),
    staleTime: 1000 * 60, // 1 minute
  });
}

export function useNotificationsQuery(pageNumber = 1, pageSize = 20, options?: { enabled?: boolean }) {
  return useQuery<PaginatedList<NotificationDto>>({
    queryKey: queryKeys.notifications.list({ pageNumber, pageSize }),
    queryFn: () => apiClient.getNotifications(pageNumber, pageSize),
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
