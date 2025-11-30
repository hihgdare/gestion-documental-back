import { DocumentRepository } from '../repositories/document.repository';
import { DocumentHistoryRepository } from '../repositories/document-history.repository';
import { Document, DocumentProps } from '../entities/document.entity';
import { DocumentHistoryProps } from '../entities/document-history.entity';
import { DocumentAction } from '../value-objects/document-enums';

export interface CreateDocumentRequest {
  documentTypeId: string;
  documentSubtypeId: string;
  name: string;
  issuedDate: Date;
  expirationDate?: Date;
  description?: string;
  documentUrl?: string;
  createdBy: string;
  comment?: string;
}

export class CreateDocumentUseCase {
  constructor(
    private readonly documentRepository: DocumentRepository,
    private readonly documentHistoryRepository: DocumentHistoryRepository,
  ) {}

  public async execute(request: CreateDocumentRequest): Promise<Document> {
    // Create document
    const documentProps: DocumentProps = {
      documentTypeId: request.documentTypeId,
      documentSubtypeId: request.documentSubtypeId,
      name: request.name,
      issuedDate: request.issuedDate,
      expirationDate: request.expirationDate,
      description: request.description,
      documentUrl: request.documentUrl,
      createdBy: request.createdBy,
    };

    const document = Document.create(documentProps);

    // Save document
    const savedDocument = await this.documentRepository.save(document);

    // Create history entry
    const historyProps: DocumentHistoryProps = {
      documentId: savedDocument.id,
      documentTypeId: savedDocument.documentTypeId,
      documentSubtypeId: savedDocument.documentSubtypeId,
      name: savedDocument.name,
      issuedDate: savedDocument.issuedDate,
      expirationDate: savedDocument.expirationDate,
      description: savedDocument.description,
      documentUrl: savedDocument.documentUrl,
      status: savedDocument.status,
      comment: request.comment || null,
      action: DocumentAction.CREATED,
      updatedBy: request.createdBy,
    };

    await this.documentHistoryRepository.save(historyProps);

    return savedDocument;
  }
}
