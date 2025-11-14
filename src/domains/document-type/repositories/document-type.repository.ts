import { Repository } from '@shared/domain/base-entity';
import { DocumentType } from '../entities/document-type.entity';

export interface DocumentTypeRepository extends Repository<DocumentType> {
  findByName(name: string): Promise<DocumentType | null>;
  existsByName(name: string): Promise<boolean>;
}
