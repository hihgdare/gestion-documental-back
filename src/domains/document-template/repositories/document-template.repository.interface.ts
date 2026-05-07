import { DocumentTemplate } from '../entities/document-template.entity';

export interface IDocumentTemplateRepository {
  save(template: DocumentTemplate): Promise<DocumentTemplate>;
  findById(id: string): Promise<DocumentTemplate | null>;
  findAll(groupId?: number): Promise<DocumentTemplate[]>;
  findByCode(code: string): Promise<DocumentTemplate[]>;
  findLatestByCode(code: string, groupId: number): Promise<DocumentTemplate | null>;
  delete(id: string): Promise<void>;
  getNextCode(): Promise<string>;
}
