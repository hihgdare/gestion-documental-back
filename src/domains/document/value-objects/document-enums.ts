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
  SIGNATURE_INITIATED = 'signature_initiated',
  SIGNATURE_SIGNED = 'signature_signed',
  SIGNATURE_REJECTED = 'signature_rejected',
  SIGNATURE_REJECTED_CANCELLED_BY_USER = 'signature_rejected_cancelled_by_user',
  SIGNATURE_REJECTED_TIMEOUT = 'signature_rejected_timeout',
  SIGNATURE_REJECTED_MAX_ATTEMPTS = 'signature_rejected_max_attempts',
}
