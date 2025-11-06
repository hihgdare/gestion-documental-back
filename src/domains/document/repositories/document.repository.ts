import { Repository } from '@shared/domain/base-entity';
import { Document } from '../entities/document.entity';

export interface DocumentRepository extends Repository<Document> {
  findByContractId(contractId: string): Promise<Document[]>;
  findByDocumentTypeId(documentTypeId: string): Promise<Document[]>;
  findByDocumentSubtypeId(documentSubtypeId: string): Promise<Document[]>;
  findExpiredDocuments(): Promise<Document[]>;
  findExpiringDocuments(days: number): Promise<Document[]>;
}
