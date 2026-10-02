import { useEffect, useRef } from "react";
import { HubConnection, HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys, tokenStorage } from "@shared/api/index.ts";
import { useAuth } from "@shared/context/index.ts";

export const NOTIFICATION_ARRIVED_EVENT = "pority_notification_arrived";

export function useNotificationRealtime() {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  const connectionRef = useRef<HubConnection | null>(null);

  useEffect(() => {
    const token = tokenStorage.getToken();
    if (!currentUser || !token) {
      if (connectionRef.current) {
        connectionRef.current.stop().catch(() => {});
        connectionRef.current = null;
      }
      return;
    }

    const connection = new HubConnectionBuilder()
      .withUrl("/hubs/notifications", {
        accessTokenFactory: () => tokenStorage.getToken() || "",
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(LogLevel.Warning)
      .build();

    connection.on("NotificationReceived", () => {
      // Invalidate queries so unread count updates immediately without showing notification details
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });

      // Dispatch single-shot event to trigger bell & badge animation
      window.dispatchEvent(new CustomEvent(NOTIFICATION_ARRIVED_EVENT));
    });

    connection.on("BroadcastReceived", () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
      window.dispatchEvent(new CustomEvent(NOTIFICATION_ARRIVED_EVENT));
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
