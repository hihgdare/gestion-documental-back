export interface DashboardMetricsDto {
  documentsInDraft: number;
  documentsWithoutColaborator: number;
  documentsExpiringSoon: number;
  documentsInReview: number;
  recentDocuments: Document[];
  documentsRecentlyApproved: Document[];
}
