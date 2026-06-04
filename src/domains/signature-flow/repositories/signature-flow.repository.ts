import { SignatureFlow } from '../entities/signature-flow.entity';

export interface SignatureFlowRepository {
  findById(id: string): Promise<SignatureFlow | null>;
  findByDocumentId(documentId: string): Promise<SignatureFlow[]>;
  findActiveByDocumentId(documentId: string): Promise<SignatureFlow | null>;
  save(flow: SignatureFlow): Promise<SignatureFlow>;
  update(flow: SignatureFlow): Promise<SignatureFlow>;
  delete(id: string): Promise<void>;
}
