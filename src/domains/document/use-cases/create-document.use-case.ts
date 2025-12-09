import { DocumentRepository } from '../repositories/document.repository';
import { DocumentHistoryRepository } from '../repositories/document-history.repository';
import { Document, DocumentProps } from '../entities/document.entity';
import { DocumentHistoryProps } from '../entities/document-history.entity';
import { DocumentAction } from '../value-objects/document-enums';
import { ValidationError } from '@shared/domain/errors';

export interface CreateDocumentRequest {
  templateId: string;
  colaboratorId: string;
  name: string;
  issuedDate: Date;
  expirationDate?: Date;
  contractId?: string;
  description?: string;
  documentUrl?: string;
  createdBy?: string;
  comment?: string;
}

export class CreateDocumentUseCase {
  constructor(
    private readonly documentRepository: DocumentRepository,
    private readonly documentHistoryRepository: DocumentHistoryRepository,
  ) {}

  public async execute(request: CreateDocumentRequest): Promise<Document> {
    // Regla: no permitir documentos simultáneos con misma plantilla y colaborador
    const exists = await this.documentRepository.existsByTemplateAndColaborator(
      request.templateId,
      request.colaboratorId,
    );
    if (exists) {
      throw new ValidationError('Ya existe un documento activo con la misma plantilla y colaborador');
    }
    // Create document
    const documentProps: DocumentProps = {
      templateId: request.templateId,
      colaboratorId: request.colaboratorId,
      name: request.name,
      issuedDate: request.issuedDate,
      expirationDate: request.expirationDate,
      contractId: request.contractId,
      description: request.description,
      documentUrl: request.documentUrl,
      createdBy: request.createdBy,
    };

    const document = Document.create(documentProps);

    // Save document
    const savedDocument = await this.documentRepository.save(document);

    // Create history entry when user context is available
    if (request.createdBy && request.createdBy !== 'system') {
      const historyProps: DocumentHistoryProps = {
        documentId: savedDocument.id,
        templateId: savedDocument.templateId,
        colaboratorId: savedDocument.colaboratorId,
        name: savedDocument.name,
        issuedDate: savedDocument.issuedDate,
        expirationDate: savedDocument.expirationDate,
        contractId: savedDocument.contractId,
        description: savedDocument.description,
        documentUrl: savedDocument.documentUrl,
        status: savedDocument.status,
        comment: request.comment || null,
        action: DocumentAction.CREATED,
        updatedBy: request.createdBy,
      };
      await this.documentHistoryRepository.save(historyProps);
    }

    return savedDocument;
  }
}
