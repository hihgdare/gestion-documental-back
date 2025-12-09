import { DocumentTemplate } from '../entities/document-template.entity';

export interface DocumentTemplateRepository {
  findById(id: string): Promise<DocumentTemplate | null>;
  findAll(): Promise<DocumentTemplate[]>;
  save(template: DocumentTemplate): Promise<DocumentTemplate>;
  update(template: DocumentTemplate): Promise<DocumentTemplate>;
  delete(id: string): Promise<void>;
  findByName(name: string): Promise<DocumentTemplate | null>;
  existsByName(name: string): Promise<boolean>;
}
