import { DocumentRepository } from '../repositories/document.repository';
import { Document } from '../entities/document.entity';
import { NotFoundError } from '@shared/domain/errors';

export class GetDocumentByIdUseCase {
  constructor(private readonly documentRepository: DocumentRepository) {}

  public async execute(id: string): Promise<Document> {
    const document = await this.documentRepository.findById(id);
    if (!document) {
      throw new NotFoundError('Documento', id);
    }
    return document;
  }
}

export class GetAllDocumentsUseCase {
  constructor(private readonly documentRepository: DocumentRepository) {}

  public async execute(): Promise<Document[]> {
    return await this.documentRepository.findAll();
  }
}

export class GetDocumentsByDocumentTypeIdUseCase {
  constructor(private readonly documentRepository: DocumentRepository) {}

  public async execute(documentTypeId: string): Promise<Document[]> {
    return await this.documentRepository.findByDocumentTypeId(documentTypeId);
  }
}

export class GetDocumentsByDocumentSubtypeIdUseCase {
  constructor(private readonly documentRepository: DocumentRepository) {}

  public async execute(documentSubtypeId: string): Promise<Document[]> {
    return await this.documentRepository.findByDocumentSubtypeId(documentSubtypeId);
  }
}

export class GetExpiredDocumentsUseCase {
  constructor(private readonly documentRepository: DocumentRepository) {}

  public async execute(): Promise<Document[]> {
    return await this.documentRepository.findExpiredDocuments();
  }
}

export class GetExpiringDocumentsUseCase {
  constructor(private readonly documentRepository: DocumentRepository) {}

  public async execute(days: number): Promise<Document[]> {
    return await this.documentRepository.findExpiringDocuments(days);
  }
}
