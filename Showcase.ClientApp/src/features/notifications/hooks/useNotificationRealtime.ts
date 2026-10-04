import { useEffect, useRef } from "react";
import { HubConnection, HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient, queryKeys } from "@shared/api/index.ts";
import { useAuth } from "@shared/context/index.ts";

export const NOTIFICATION_ARRIVED_EVENT = "pority_notification_arrived";

interface NotificationPayload {
  title?: string;
  message?: string;
  payload?: unknown;
}

export function useNotificationRealtime() {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  const connectionRef = useRef<HubConnection | null>(null);

  useEffect(() => {
    if (!currentUser) {
      if (connectionRef.current) {
        connectionRef.current.stop().catch(() => {});
        connectionRef.current = null;
      }
      return;
    }

    const connection = new HubConnectionBuilder()
      .withUrl("/hubs/notifications", {
        withCredentials: true,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(LogLevel.Warning)
      .build();

    connection.on("NotificationReceived", (data?: NotificationPayload) => {
      // Invalidate queries so unread count and notification list refresh
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });

      // Dispatch event to trigger bell animation
      window.dispatchEvent(new CustomEvent(NOTIFICATION_ARRIVED_EVENT));

      // Show toast if user is not currently looking at the notifications page
      if (typeof window !== "undefined" && window.location.pathname !== "/notifications") {
        if (data?.message) {
          toast.info(data.message, {
            description: data.title,
          });
        }
      }
    });

    connection.on("BroadcastReceived", (data?: { title?: string; message?: string }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
      window.dispatchEvent(new CustomEvent(NOTIFICATION_ARRIVED_EVENT));

      if (data?.message) {
        toast.info(data.message, {
          description: data.title || "Announcement",
        });
      }
    });

    connection.onreconnected(() => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    });

    let isSubscribed = true;

    const startConnection = () => {
      if (connection.state === "Disconnected" && isSubscribed && document.visibilityState === "visible") {
        connection
          .start()
          .then(() => {
            if (isSubscribed) {
              connectionRef.current = connection;
            } else {
              connection.stop().catch(() => {});
            }
          })
          .catch((err) => {
            if (isSubscribed) {
              console.warn("SignalR NotificationHub connection failed:", err);
              if (String(err).includes("401") || String(err).includes("Unauthorized")) {
                void apiClient.getCurrentUser().catch(() => {});
              }
            }
          });
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
        startConnection();
      } else {
        if (connectionRef.current && connectionRef.current.state === "Connected") {
          connectionRef.current.stop().catch(() => {});
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    startConnection();

    return () => {
      isSubscribed = false;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (connectionRef.current) {
        connectionRef.current.stop().catch(() => {});
        connectionRef.current = null;
      } else {
        connection.stop().catch(() => {});
      }
    };
  }, [currentUser, queryClient]);
}
