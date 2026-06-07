import { SignatureFlow } from '../entities/signature-flow.entity';

export interface PendingSignatureDocumentsReportItem {
  flowId: string;
  documentId: string;
  documentName: string;
  documentStatus: string;
  documentTypeName: string | null;
  documentSubtypeName: string | null;
  contractNumber: string | null;
  sentAt: Date | null;
  sentByName: string | null;
  currentHolders: string[];
}

export interface SignatureProcessTimeReportItem {
  flowId: string;
  documentId: string;
  documentName: string;
  sentAt: Date;
  signedAt: Date;
  elapsedDays: number;
}

export interface SignatureFlowRepository {
  findById(id: string): Promise<SignatureFlow | null>;
  findByDocumentId(documentId: string): Promise<SignatureFlow[]>;
  findActiveByDocumentId(documentId: string): Promise<SignatureFlow | null>;
  findPendingDocumentsReport(groupId?: number): Promise<PendingSignatureDocumentsReportItem[]>;
  findSigningTimeReport(groupId?: number): Promise<SignatureProcessTimeReportItem[]>;
  save(flow: SignatureFlow): Promise<SignatureFlow>;
  update(flow: SignatureFlow): Promise<SignatureFlow>;
  delete(id: string): Promise<void>;
}
