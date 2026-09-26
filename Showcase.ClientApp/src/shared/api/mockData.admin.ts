import type {
  AuditLogItem,
  BroadcastAnnouncementItem,
  ContentReportItem,
  FeaturedRecommendationItem,
  StorageTelemetryDto,
  VerificationRequestItem,
} from "../types/index.ts";

export const INITIAL_VERIFICATION_REQUESTS: VerificationRequestItem[] = [];
export const INITIAL_CONTENT_REPORTS: ContentReportItem[] = [];
export const INITIAL_FEATURED_RECOMMENDATIONS: FeaturedRecommendationItem[] = [];

export const INITIAL_STORAGE_TELEMETRY: StorageTelemetryDto = {
  totalCapacityBytes: 50 * 1024 * 1024 * 1024,
  usedBytes: 0,
  totalFilesCount: 0,
  monthlyBandwidthBytes: 0,
  requestsCount: 0,
  breakdown: {
    imagesBytes: 0,
    documentsBytes: 0,
    thumbnailsBytes: 0,
  },
  topConsumers: [],
};

export const INITIAL_AUDIT_LOGS: AuditLogItem[] = [];
export const INITIAL_BROADCASTS: BroadcastAnnouncementItem[] = [];
