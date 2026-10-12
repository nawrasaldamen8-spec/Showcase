import { tokenStorage } from "../api/tokenStorage.ts";

export type AuthSyncEvent = "refresh-start" | "refresh-success" | "auth-expired";

interface FailedQueueItem {
  resolve: () => void;
  reject: (error: unknown) => void;
}

class AuthSyncService {
  private isRefreshingState = false;
  private failedQueue: FailedQueueItem[] = [];
  private channel: BroadcastChannel | null = null;
  private readonly channelName = "showcase_auth_sync";

  constructor() {
    this.initBroadcastChannel();
  }

  private initBroadcastChannel() {
    if (typeof window !== "undefined" && typeof BroadcastChannel !== "undefined") {
      try {
        this.channel = new BroadcastChannel(this.channelName);
        this.channel.onmessage = (event) => {
          if (event.data === "refresh-start") {
            this.isRefreshingState = true;
          } else if (event.data === "refresh-success") {
            this.isRefreshingState = false;
            this.flushQueue(null);
          } else if (event.data === "auth-expired") {
            this.isRefreshingState = false;
            tokenStorage.clear();
            window.dispatchEvent(new CustomEvent("showcase:auth-expired"));
            this.flushQueue(new Error("Session expired"));
          }
        };
      } catch {
        // BroadcastChannel unavailable or restricted
      }
    }
  }

  public isRefreshing(): boolean {
    return this.isRefreshingState;
  }

  public setRefreshing(value: boolean): void {
    this.isRefreshingState = value;
    if (value) {
      try {
        this.channel?.postMessage("refresh-start");
      } catch {
        // Ignore broadcast errors
      }
    }
  }

  public enqueue(resolve: () => void, reject: (error: unknown) => void): void {
    this.failedQueue.push({ resolve, reject });
  }

  public flushQueue(error: unknown | null): void {
    const queue = [...this.failedQueue];
    this.failedQueue = [];

    queue.forEach((item) => {
      if (error) {
        item.reject(error);
      } else {
        item.resolve();
      }
    });
  }

  public notifyRefreshSuccess(): void {
    this.isRefreshingState = false;
    try {
      this.channel?.postMessage("refresh-success");
    } catch {
      // Ignore broadcast errors
    }
    this.flushQueue(null);
  }

  public notifyAuthExpired(error?: unknown): void {
    this.isRefreshingState = false;
    tokenStorage.clear();
    try {
      this.channel?.postMessage("auth-expired");
    } catch {
      // Ignore broadcast errors
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("showcase:auth-expired"));
    }
    this.flushQueue(error || new Error("Session expired"));
  }
}

export const authSyncService = new AuthSyncService();
