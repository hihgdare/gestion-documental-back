export enum DocumentStatus {
  DRAFT = 'draft',
  IN_REVIEW = 'in_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  REJECTED_WITH_COMMENTS = 'rejected_with_comments',
  EXPIRED = 'expired',
  OBSOLETE = 'obsolete',
  ARCHIVED = 'archived',
}

export enum DocumentAction {
  CREATED = 'created',
  UPDATED = 'updated',
  SUBMITTED_FOR_REVIEW = 'submitted_for_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  REJECTED_WITH_COMMENTS = 'rejected_with_comments',
  ARCHIVED = 'archived',
  RESTORED = 'restored',
}
