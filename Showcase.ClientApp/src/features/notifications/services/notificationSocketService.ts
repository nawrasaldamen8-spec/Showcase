import { HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel } from "@microsoft/signalr";

export interface NotificationPayload {
  title?: string;
  message?: string;
  payload?: unknown;
}

export interface BroadcastPayload {
  title?: string;
  message?: string;
}

type NotificationListener = (data?: NotificationPayload) => void;
type BroadcastListener = (data?: BroadcastPayload) => void;
type ReconnectedListener = () => void;

class NotificationSocketService {
  private connection: HubConnection | null = null;
  private notificationListeners = new Set<NotificationListener>();
  private broadcastListeners = new Set<BroadcastListener>();
  private reconnectedListeners = new Set<ReconnectedListener>();
  private isConnecting = false;

  private createConnection(): HubConnection {
    const conn = new HubConnectionBuilder()
      .withUrl("/hubs/notifications", {
        withCredentials: true,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(LogLevel.Warning)
      .build();

    conn.on("ReceiveNotification", (data?: NotificationPayload) => {
      this.notificationListeners.forEach((fn) => fn(data));
    });

    conn.on("NotificationReceived", (data?: NotificationPayload) => {
      this.notificationListeners.forEach((fn) => fn(data));
    });

    conn.on("BroadcastReceived", (data?: BroadcastPayload) => {
      this.broadcastListeners.forEach((fn) => fn(data));
    });

    conn.onreconnected(() => {
      this.reconnectedListeners.forEach((fn) => fn());
    });

    return conn;
  }

  public async startConnection(): Promise<void> {
    if (this.connection?.state === HubConnectionState.Connected || this.isConnecting) {
      return;
    }

    if (!this.connection) {
      this.connection = this.createConnection();
    }

    if (this.connection.state === HubConnectionState.Disconnected) {
      this.isConnecting = true;
      try {
        await this.connection.start();
      } catch (err) {
        console.warn("SignalR NotificationHub connection attempt failed:", err);
      } finally {
        this.isConnecting = false;
      }
    }
  }

  public async stopConnection(): Promise<void> {
    if (this.connection) {
      try {
        await this.connection.stop();
      } catch {
        // Ignore stop errors during teardown
      }
      this.connection = null;
    }
  }

  public onNotification(listener: NotificationListener): () => void {
    this.notificationListeners.add(listener);
    return () => {
      this.notificationListeners.delete(listener);
    };
  }

  public onBroadcast(listener: BroadcastListener): () => void {
    this.broadcastListeners.add(listener);
    return () => {
      this.broadcastListeners.delete(listener);
    };
  }

  public onReconnected(listener: ReconnectedListener): () => void {
    this.reconnectedListeners.add(listener);
    return () => {
      this.reconnectedListeners.delete(listener);
    };
  }

  public getState(): HubConnectionState {
    return this.connection?.state ?? HubConnectionState.Disconnected;
  }
}

export const notificationSocketService = new NotificationSocketService();
