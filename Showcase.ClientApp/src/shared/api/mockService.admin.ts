import type {
  AdminDashboardMetricsDto,
  AdminUserListItem,
  AuditLogItem,
  BroadcastAnnouncementItem,
  ContentReportItem,
  FeaturedRecommendationItem,
  StorageTelemetryDto,
  UserRole,
  UserStatus,
  VerificationRequestItem,
} from "../types/index.ts";
import {
  INITIAL_AUDIT_LOGS,
  INITIAL_BROADCASTS,
  INITIAL_CONTENT_REPORTS,
  INITIAL_FEATURED_RECOMMENDATIONS,
  INITIAL_STORAGE_TELEMETRY,
  INITIAL_VERIFICATION_REQUESTS,
} from "./mockData.admin.ts";
import { generateUuid, mockDb, simulateNetworkLatency } from "./mockDb.ts";

const ADMIN_STORAGE_KEYS = {
  VERIFICATIONS: "pority_admin_verifications",
  REPORTS: "pority_admin_reports",
  FEATURED: "pority_admin_featured",
  AUDIT_LOGS: "pority_admin_audit_logs",
  BROADCASTS: "pority_admin_broadcasts",
};

function loadStored<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch {
    // ignore
  }
  return fallback;
}

function saveStored<T>(key: string, data: T): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(data));
  }
}

export const mockAdminService = {
  async getDashboardMetrics(): Promise<AdminDashboardMetricsDto> {
    await simulateNetworkLatency(60, 140);
    const db = mockDb.loadDb();
    const verifs = await this.getVerificationRequests();
    const reports = await this.getContentReports();
    const featured = await this.getFeaturedRecommendations();
    const storage = await this.getStorageTelemetry();
    const auditLogs = await this.getAuditLogs();
    const broadcasts = await this.getBroadcasts();

    return {
      totalUsersCount: db.users.length,
      activeCreatorsCount: db.profiles.length,
      pendingVerificationsCount: verifs.filter((v) => v.status === "pending").length,
      pendingReportsCount: reports.filter((r) => r.status === "pending").length,
      curatedPinnedCount: featured.filter((f) => f.isCuratedPinned).length,
      storageUsedBytes: storage.usedBytes,
      storageCapacityBytes: storage.totalCapacityBytes,
      recentAuditLogs: auditLogs.slice(0, 5),
      recentBroadcasts: broadcasts.slice(0, 5),
    };
  },

  async getUsers(search = "", statusFilter = "all", roleFilter = "all"): Promise<AdminUserListItem[]> {
    await simulateNetworkLatency(80, 160);
    const db = mockDb.loadDb();

    const list: AdminUserListItem[] = db.users.map((u) => {
      const p = db.profiles.find((pr) => pr.id === u.profileId || pr.userId === u.id);
      const userPosts = db.posts.filter((post) => post.profileId === p?.id);
      const status: UserStatus = u.isBanned ? "suspended" : "active";

      return {
        id: u.id,
        email: u.email,
        username: u.username,
        firstName: p?.firstName || u.username,
        lastName: p?.lastName || "",
        avatarUrl: p?.avatarUrl || null,
        roles: (u.roles || ["Creator"]) as UserRole[],
        status,
        isVerified: !!(p?.isVerified || u.isVerified),
        featuredStatus: p?.featuredStatus || u.featuredStatus || "none",
        postsCount: userPosts.length,
        storageUsedBytes: Math.max(userPosts.length * 15 * 1024 * 1024, 25 * 1024 * 1024),
        createdAt: p?.createdAt || new Date().toISOString(),
        banReason: u.banReason || null,
      };
    });

    return list.filter((user) => {
      const matchesSearch =
        !search.trim() ||
        user.username.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && user.status === "active") ||
        (statusFilter === "suspended" && user.status === "suspended");

      const matchesRole = roleFilter === "all" || user.roles.includes(roleFilter as UserRole);

      return matchesSearch && matchesStatus && matchesRole;
    });
  },

  async banUser(userId: string, reason: string): Promise<void> {
    await simulateNetworkLatency(100, 200);
    const db = mockDb.loadDb();
    const user = db.users.find((u) => u.id === userId);
    if (!user) throw new Error("User not found");

    user.isBanned = true;
    user.banReason = reason.trim() || "Violation of platform standards.";
    mockDb.saveDb(db);

    await this.logAuditAction({
      action: "user_banned",
      targetId: user.id,
      targetLabel: `@${user.username}`,
      reason: user.banReason,
    });
  },

  async unbanUser(userId: string): Promise<void> {
    await simulateNetworkLatency(100, 200);
    const db = mockDb.loadDb();
    const user = db.users.find((u) => u.id === userId);
    if (!user) throw new Error("User not found");

    user.isBanned = false;
    user.banReason = undefined;
    mockDb.saveDb(db);

    await this.logAuditAction({
      action: "user_unbanned",
      targetId: user.id,
      targetLabel: `@${user.username}`,
      reason: "Administrative reinstatement.",
    });
  },

  async updateUserRole(userId: string, roles: UserRole[]): Promise<void> {
    await simulateNetworkLatency(100, 200);
    const db = mockDb.loadDb();
    const user = db.users.find((u) => u.id === userId);
    if (!user) throw new Error("User not found");

    user.roles = roles;
    mockDb.saveDb(db);

    await this.logAuditAction({
      action: "role_modified",
      targetId: user.id,
      targetLabel: `@${user.username}`,
      reason: `Assigned roles: ${roles.join(", ")}`,
    });
  },

  async getVerificationRequests(): Promise<VerificationRequestItem[]> {
    await simulateNetworkLatency(80, 160);
    return loadStored<VerificationRequestItem[]>(ADMIN_STORAGE_KEYS.VERIFICATIONS, INITIAL_VERIFICATION_REQUESTS);
  },

  async approveVerificationRequest(requestId: string, note = ""): Promise<void> {
    await simulateNetworkLatency(100, 200);
    const list = await this.getVerificationRequests();
    const req = list.find((r) => r.id === requestId);
    if (!req) throw new Error("Verification request not found");

    req.status = "approved";
    req.decisionNote = note || "Approved by administration.";
    saveStored(ADMIN_STORAGE_KEYS.VERIFICATIONS, list);

    const db = mockDb.loadDb();
    const user = db.users.find((u) => u.id === req.userId || u.username === req.username);
    if (user) {
      user.isVerified = true;
      user.verificationStatus = "verified";
      const profile = db.profiles.find((p) => p.id === user.profileId || p.userId === user.id);
      if (profile) {
        profile.isVerified = true;
        profile.verificationStatus = "verified";
      }
      mockDb.saveDb(db);
    }

    await this.logAuditAction({
      action: "verification_approved",
      targetId: req.userId,
      targetLabel: `@${req.username} (${req.fullName})`,
      reason: note || "Verified credentials and identity.",
    });
  },

  async rejectVerificationRequest(requestId: string, note = ""): Promise<void> {
    await simulateNetworkLatency(100, 200);
    const list = await this.getVerificationRequests();
    const req = list.find((r) => r.id === requestId);
    if (!req) throw new Error("Verification request not found");

    req.status = "rejected";
    req.decisionNote = note || "Application does not meet current verification guidelines.";
    saveStored(ADMIN_STORAGE_KEYS.VERIFICATIONS, list);

    const db = mockDb.loadDb();
    const user = db.users.find((u) => u.id === req.userId || u.username === req.username);
    if (user) {
      user.verificationStatus = "rejected";
      const profile = db.profiles.find((p) => p.id === user.profileId || p.userId === user.id);
      if (profile) {
        profile.verificationStatus = "rejected";
      }
      mockDb.saveDb(db);
    }

    await this.logAuditAction({
      action: "verification_rejected",
      targetId: req.userId,
      targetLabel: `@${req.username} (${req.fullName})`,
      reason: note || "Declined verification badge request.",
    });
  },

  async getContentReports(statusFilter = "all"): Promise<ContentReportItem[]> {
    await simulateNetworkLatency(80, 160);
    const list = loadStored<ContentReportItem[]>(ADMIN_STORAGE_KEYS.REPORTS, INITIAL_CONTENT_REPORTS);
    if (statusFilter === "all") return list;
    return list.filter((r) => r.status === statusFilter);
  },

  async resolveReport(reportId: string, actionTaken: string): Promise<void> {
    await simulateNetworkLatency(100, 200);
    const list = await this.getContentReports();
    const rep = list.find((r) => r.id === reportId);
    if (!rep) throw new Error("Report not found");

    rep.status = "resolved";
    rep.actionTaken = actionTaken;
    saveStored(ADMIN_STORAGE_KEYS.REPORTS, list);

    await this.logAuditAction({
      action: "post_hidden",
      targetId: rep.targetId,
      targetLabel: `${rep.targetType}: ${rep.targetTitle}`,
      reason: actionTaken,
    });
  },

  async dismissReport(reportId: string): Promise<void> {
    await simulateNetworkLatency(80, 150);
    const list = await this.getContentReports();
    const rep = list.find((r) => r.id === reportId);
    if (!rep) throw new Error("Report not found");

    rep.status = "dismissed";
    rep.actionTaken = "Report dismissed as non-violating.";
    saveStored(ADMIN_STORAGE_KEYS.REPORTS, list);
  },

  async getFeaturedRecommendations(): Promise<FeaturedRecommendationItem[]> {
    await simulateNetworkLatency(80, 150);
    return loadStored<FeaturedRecommendationItem[]>(
      ADMIN_STORAGE_KEYS.FEATURED,
      INITIAL_FEATURED_RECOMMENDATIONS
    );
  },

  async toggleCuratedPin(id: string, isPinned: boolean): Promise<void> {
    await simulateNetworkLatency(80, 150);
    const list = await this.getFeaturedRecommendations();
    const item = list.find((f) => f.id === id);
    if (!item) throw new Error("Featured recommendation not found");

    item.isCuratedPinned = isPinned;
    if (isPinned) item.status = "featured";
    saveStored(ADMIN_STORAGE_KEYS.FEATURED, list);

    await this.logAuditAction({
      action: isPinned ? "featured_pinned" : "featured_unpinned",
      targetId: item.userId,
      targetLabel: `@${item.username}`,
      reason: isPinned ? "Pinned to discovery curated spotlight." : "Removed from pinned spotlight.",
    });
  },

  async approveFeaturedRequest(id: string): Promise<void> {
    await simulateNetworkLatency(80, 150);
    const list = await this.getFeaturedRecommendations();
    const item = list.find((f) => f.id === id);
    if (!item) throw new Error("Featured item not found");

    item.status = "featured";
    item.isCuratedPinned = true;
    saveStored(ADMIN_STORAGE_KEYS.FEATURED, list);

    await this.logAuditAction({
      action: "featured_pinned",
      targetId: item.userId,
      targetLabel: `@${item.username}`,
      reason: "Approved for discovery featured suggestions rotation.",
    });
  },

  async rejectFeaturedRequest(id: string): Promise<void> {
    await simulateNetworkLatency(80, 150);
    const list = await this.getFeaturedRecommendations();
    const item = list.find((f) => f.id === id);
    if (!item) throw new Error("Featured item not found");

    item.status = "rejected";
    item.isCuratedPinned = false;
    saveStored(ADMIN_STORAGE_KEYS.FEATURED, list);
  },

  async getStorageTelemetry(): Promise<StorageTelemetryDto> {
    await simulateNetworkLatency(80, 160);
    return INITIAL_STORAGE_TELEMETRY;
  },

  async getAuditLogs(): Promise<AuditLogItem[]> {
    await simulateNetworkLatency(60, 120);
    return loadStored<AuditLogItem[]>(ADMIN_STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
  },

  async logAuditAction(entry: Omit<AuditLogItem, "id" | "timestamp" | "adminId" | "adminUsername">): Promise<void> {
    const list = await this.getAuditLogs();
    const newLog: AuditLogItem = {
      id: generateUuid(),
      adminId: "usr_admin",
      adminUsername: "pority_admin",
      timestamp: new Date().toISOString(),
      ...entry,
    };
    list.unshift(newLog);
    saveStored(ADMIN_STORAGE_KEYS.AUDIT_LOGS, list);
  },

  async getBroadcasts(): Promise<BroadcastAnnouncementItem[]> {
    await simulateNetworkLatency(60, 120);
    return loadStored<BroadcastAnnouncementItem[]>(ADMIN_STORAGE_KEYS.BROADCASTS, INITIAL_BROADCASTS);
  },

  async createBroadcast(
    item: Omit<BroadcastAnnouncementItem, "id" | "publishedAt" | "adminUsername">
  ): Promise<void> {
    await simulateNetworkLatency(100, 200);
    const list = await this.getBroadcasts();
    const newBroadcast: BroadcastAnnouncementItem = {
      id: generateUuid(),
      publishedAt: new Date().toISOString(),
      adminUsername: "pority_admin",
      ...item,
    };
    list.unshift(newBroadcast);
    saveStored(ADMIN_STORAGE_KEYS.BROADCASTS, list);

    await this.logAuditAction({
      action: "broadcast_sent",
      targetId: newBroadcast.id,
      targetLabel: newBroadcast.title,
      reason: `Broadcast [${newBroadcast.severity}] dispatched to ${newBroadcast.scope}.`,
    });
  },
};
