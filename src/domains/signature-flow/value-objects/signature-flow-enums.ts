export enum SignatureFlowOrderType {
  SEQUENTIAL = 'sequential',
  PARALLEL = 'parallel',
}

export enum SignatureFlowStatus {
  DRAFT = 'draft',
  IN_REVIEW = 'in_review',
  IN_SIGNING = 'in_signing',
  SIGNED = 'signed',
  REJECTED = 'rejected',
}

export enum SignatureFlowParticipantRole {
  SIGNER = 'signer',
  VALIDATOR = 'validator',
}

export enum SignatureFlowParticipantStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  SIGNED = 'signed',
  REJECTED = 'rejected',
}

export enum SignatureFlowNotificationType {
  INITIAL = 'initial',
  RESEND = 'resend',
  REMINDER = 'reminder',
}
