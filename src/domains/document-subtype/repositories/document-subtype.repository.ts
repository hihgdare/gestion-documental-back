import { Repository } from '@shared/domain/base-entity';
import { DocumentSubtype } from '../entities/document-subtype.entity';

export interface DocumentSubtypeRepository extends Repository<DocumentSubtype> {
  findByName(name: string): Promise<DocumentSubtype | null>;
  findByDocumentTypeId(documentTypeId: string): Promise<DocumentSubtype[]>;
  existsByName(name: string): Promise<boolean>;
  existsByNameAndDocumentTypeId(name: string, documentTypeId: string): Promise<boolean>;
}
