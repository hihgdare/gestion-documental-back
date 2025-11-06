import { DocumentRepository } from '../repositories/document.repository';
import { Document } from '../entities/document.entity';
import { NotFoundError } from '@shared/domain/errors';

export interface UpdateDocumentRequest {
  documentTypeId?: string;
  documentSubtypeId?: string;
  name?: string;
  issuedDate?: Date;
  expirationDate?: Date;
  description?: string;
  documentUrl?: string;
}

export class UpdateDocumentUseCase {
  constructor(private readonly documentRepository: DocumentRepository) {}

  public async execute(id: string, request: UpdateDocumentRequest): Promise<Document> {
    const document = await this.documentRepository.findById(id);
    if (!document) {
      throw new NotFoundError('Documento', id);
    }

    // Update fields
    if (request.name !== undefined) {
      document.updateName(request.name);
    }

    if (request.documentTypeId !== undefined) {
      document.updateDocumentTypeId(request.documentTypeId);
    }

    if (request.documentSubtypeId !== undefined) {
      document.updateDocumentSubtypeId(request.documentSubtypeId);
    }

    if (request.issuedDate !== undefined || request.expirationDate !== undefined) {
      document.updateDates(
        request.issuedDate || document.issuedDate,
        request.expirationDate !== undefined ? request.expirationDate : (document.expirationDate || undefined),
      );
    }

    if (request.description !== undefined) {
      document.updateDescription(request.description);
    }

    if (request.documentUrl !== undefined) {
      document.updateDocumentUrl(request.documentUrl);
    }

    return await this.documentRepository.update(document);
  }
}

export class DeleteDocumentUseCase {
  constructor(private readonly documentRepository: DocumentRepository) {}

  public async execute(id: string): Promise<void> {
    const document = await this.documentRepository.findById(id);
    if (!document) {
      throw new NotFoundError('Documento', id);
    }

    await this.documentRepository.delete(id);
  }
}
