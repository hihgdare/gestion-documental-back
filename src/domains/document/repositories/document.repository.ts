import { Document } from '../entities/document.entity';

export interface DocumentRepository {
  findById(id: string): Promise<Document | null>;
  findAll(): Promise<Document[]>;
  findByContractId(contractId: string): Promise<Document[]>;
  save(request: Partial<Omit<Document, 'id'>>): Promise<Document>;
  update(request: Document & { id: string }): Promise<Document>;
  delete(id: string): Promise<void>;
  findByTemplateId(templateId: string): Promise<Document[]>;
  findByColaboratorIds(colaboratorIds: string[]): Promise<Document[]>;
  findExpiredDocuments(): Promise<Document[]>;
  findExpiringDocuments(days: number): Promise<Document[]>;
  existsByTemplateAndColaborators(templateId: string, colaboratorIds: string[], excludeId?: string): Promise<boolean>;
  existsByTemplateContractColaborators(templateId: string, contractId: string, colaboratorIds: string[], excludeId?: string): Promise<boolean>;
}
