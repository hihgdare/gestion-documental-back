import { DocumentModel } from '../entities/document-model.entity';

export interface IDocumentModelRepository {
  findAll(): Promise<DocumentModel[]>;
  findById(id: string): Promise<DocumentModel | null>;
  findByFamilyId(familyId: string): Promise<DocumentModel[]>;
  findByFamilyTypeSubtype(familyId: string, documentTypeId: string, documentSubtypeId: string): Promise<DocumentModel | null>;
  create(documentModel: DocumentModel): Promise<DocumentModel>;
  update(documentModel: DocumentModel): Promise<DocumentModel>;
  delete(id: string): Promise<void>;
  softDelete(id: string): Promise<void>;
  restore(id: string): Promise<void>;
}
