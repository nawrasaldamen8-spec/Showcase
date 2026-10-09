export type UserRole = "Admin" | "Creator" | "Curator";
export type UserStatus = "active" | "suspended" | "pending_review";

export interface AdminUserListItem {
  id: string;
  email?: string | null;
  username: string;
  name: string;
  avatarUrl?: string | null;
  roles: UserRole[];
  status: UserStatus;
  isVerified: boolean;
  isFeatured?: boolean;
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
  name?: string;
  fullName?: string;
  avatarUrl?: string | null;
  specialty?: string;
  category?: string;
  message: string;
  notes?: string;
  isVerified?: boolean;
  status: "pending" | "approved" | "verified" | "rejected" | string;
  postsCount?: number;
  createdAt?: string;
  submittedAt?: string;
  decisionNote?: string;
}

export interface ContentReportItem {
  id: string;
  reporterUserId?: string;
  reporterId?: string;
  reporterUsername: string;
  targetType: "post" | "user" | string;
  targetId: string;
  targetLabel?: string;
  targetTitle?: string;
  targetAuthorUsername?: string;
  reason: "copyright" | "impersonation" | "inappropriate" | "spam" | "other" | string;
  details?: string;
  status: "pending" | "resolved" | "dismissed" | string;
  createdAt: string;
  actionTaken?: string | null;
}

export interface FeaturedRecommendationItem {
  id: string;
  userId: string;
  username: string;
  name?: string;
  fullName?: string;
  avatarUrl?: string | null;
  specialty?: string;
  headline?: string;
  message: string;
  isCuratedPin?: boolean;
  isCuratedPinned?: boolean;
  status: "none" | "pending" | "featured" | "rejected" | string;
  nominatedAt?: string;
  submittedAt?: string;
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
  planName?: string;
  creditsUsedPercent?: number;
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

export interface AdminDashboardMetricsDto {
  totalUsersCount: number;
  activeCreatorsCount: number;
  totalPublishedPosts?: number;
  pendingVerificationsCount: number;
  pendingReportsCount: number;
  curatedPinnedCount: number;
  storageUsedBytes: number;
  storageCapacityBytes: number;
  recentAuditLogs: AuditLogItem[];
}

