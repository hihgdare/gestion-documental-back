import { Document } from '../entities/document.entity';
import { DocumentStatus } from '../value-objects/document-enums';

export interface DocumentRepository {
  findById(id: string): Promise<Document | null>;
  findAll(filters?: {
    contractId?: string;
    requiredForContract?: boolean;
    requiredForColaborator?: boolean;
    status?: DocumentStatus | DocumentStatus[];
  }): Promise<Document[]>;
  findByContractId(contractId: string): Promise<Document[]>;
  save(request: Partial<Omit<Document, 'id'>>): Promise<Document>;
  update(request: Document & { id: string }): Promise<Document>;
  delete(id: string): Promise<void>;
  findByTypeAndSubtypeId(typeId: string, subtypeId: string): Promise<Document[]>;
  findByColaboratorIds(colaboratorIds: string[]): Promise<Document[]>;
  findExpiredDocuments(): Promise<Document[]>;
  findExpiringDocuments(days: number): Promise<Document[]>;
  existsByTypeSubtypeAndColaborator(typeId: string, subtypeId: string, colaboratorIds: string[], excludeId?: string): Promise<boolean>;
  existsByTypeSubtypeContractColaborator(typeId: string, subtypeId: string, contractId: string, colaboratorIds: string[], excludeId?: string): Promise<boolean>;
}
