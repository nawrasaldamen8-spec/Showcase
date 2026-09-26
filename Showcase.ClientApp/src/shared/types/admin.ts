export type UserRole = "Admin" | "Creator" | "Curator";
export type UserStatus = "active" | "suspended" | "pending_review";

export interface AdminUserListItem {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  roles: UserRole[];
  status: UserStatus;
  isVerified: boolean;
  featuredStatus: "none" | "pending" | "featured" | "rejected";
  postsCount: number;
  storageUsedBytes: number;
  createdAt: string;
  banReason?: string | null;
}

export interface VerificationRequestItem {
  id: string;
  userId: string;
  username: string;
  fullName: string;
  avatarUrl?: string | null;
  message: string;
  notes?: string;
  status: "pending" | "approved" | "rejected";
  postsCount: number;
  submittedAt: string;
  decisionNote?: string;
}

export interface ContentReportItem {
  id: string;
  reporterId: string;
  reporterUsername: string;
  targetType: "post" | "user";
  targetId: string;
  targetTitle: string;
  targetAuthorUsername: string;
  reason: "copyright" | "impersonation" | "inappropriate" | "spam" | "other";
  details: string;
  status: "pending" | "resolved" | "dismissed";
  createdAt: string;
  actionTaken?: string;
}

export interface FeaturedRecommendationItem {
  id: string;
  userId: string;
  username: string;
  fullName: string;
  avatarUrl?: string | null;
  headline: string;
  message: string;
  isCuratedPinned: boolean;
  status: "none" | "pending" | "featured" | "rejected";
  submittedAt: string;
}

export interface StorageConsumerItem {
  userId: string;
  username: string;
  fullName: string;
  avatarUrl?: string | null;
  bytesUsed: number;
  filesCount: number;
}

export interface StorageTelemetryDto {
  totalCapacityBytes: number;
  usedBytes: number;
  totalFilesCount: number;
  monthlyBandwidthBytes: number;
  requestsCount: number;
  breakdown: {
    imagesBytes: number;
    documentsBytes: number;
    thumbnailsBytes: number;
  };
  topConsumers: StorageConsumerItem[];
}

export interface AuditLogItem {
  id: string;
  adminId: string;
  adminUsername: string;
  action:
    | "user_banned"
    | "user_unbanned"
    | "verification_approved"
    | "verification_rejected"
    | "post_hidden"
    | "featured_pinned"
    | "featured_unpinned"
    | "broadcast_sent"
    | "role_modified";
  targetId: string;
  targetLabel: string;
  reason?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface BroadcastAnnouncementItem {
  id: string;
  title: string;
  message: string;
  scope: "all_users" | "creators_only" | "direct_user";
  targetUserId?: string;
  severity: "info" | "update" | "contest" | "warning";
  publishedAt: string;
  adminUsername: string;
}

export interface AdminDashboardMetricsDto {
  totalUsersCount: number;
  activeCreatorsCount: number;
  pendingVerificationsCount: number;
  pendingReportsCount: number;
  curatedPinnedCount: number;
  storageUsedBytes: number;
  storageCapacityBytes: number;
  recentAuditLogs: AuditLogItem[];
  recentBroadcasts: BroadcastAnnouncementItem[];
}
