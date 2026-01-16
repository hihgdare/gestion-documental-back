import { Document } from '@domains/document/entities/document.entity';

export interface DashboardMetricsDto {
  documentsInDraft: number;
  documentsWithoutColaborator: number;
  documentsExpiringSoon: number;
  documentsInReview: number;
  recentDocuments: Document[];
  documentsRecentlyApproved: Document[];
}
