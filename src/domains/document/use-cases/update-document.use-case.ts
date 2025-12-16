import { DocumentRepository } from '../repositories/document.repository';
import { DocumentHistoryRepository } from '../repositories/document-history.repository';
import { Document } from '../entities/document.entity';
import { DocumentHistoryProps } from '../entities/document-history.entity';
import { DocumentAction } from '../value-objects/document-enums';
import { NotFoundError } from '@shared/domain/errors';

export interface UpdateDocumentRequest {
  templateId?: string;
  colaboratorIds?: string[];
  name?: string;
  issuedDate?: Date;
  expirationDate?: Date;
  contractId?: string;
  description?: string;
  documentUrl?: string;
  updatedBy?: string;
  comment?: string;
}

export class UpdateDocumentUseCase {
  constructor(
    private readonly documentRepository: DocumentRepository,
    private readonly documentHistoryRepository: DocumentHistoryRepository,
  ) {}

  public async execute(id: string, request: UpdateDocumentRequest): Promise<Document> {
    const document = await this.documentRepository.findById(id);
    if (!document) {
      throw new NotFoundError('Documento', id);
    }

    // Update fields
    if (request.name !== undefined) {
      document.updateName(request.name);
    }

    if (request.templateId !== undefined) {
      document.updateDocumentTypeId(request.templateId);
    }

    if (request.colaboratorIds !== undefined) {
      document.updateColaborators(request.colaboratorIds);
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

    if (request.contractId !== undefined) {
      document.updateContractId(request.contractId);
    }

    // Regla: no permitir documentos simultáneos con misma plantilla (sin validar colaboradores por N:M)
    // La validación de unicidad debe hacerse a nivel de negocio
    // const exists = await this.documentRepository.existsByTemplateAndColaborator(
    //   document.templateId,
    //   document.colaboratorIds[0],
    //   document.id,
    // );
    // if (exists) {
    //   throw new ValidationError('Ya existe un documento activo con la misma plantilla y colaborador');
    // }

    // Al editar un documento, siempre vuelve a estado borrador
    document.setToDraft();

    // Update document
    const updatedDocument = await this.documentRepository.update(document);

    // Create history entry
    const historyProps: DocumentHistoryProps = {
      documentId: updatedDocument.id,
      templateId: updatedDocument.templateId,
      name: updatedDocument.name,
      issuedDate: updatedDocument.issuedDate,
      expirationDate: updatedDocument.expirationDate,
      contractId: updatedDocument.contractId,
      description: updatedDocument.description,
      documentUrl: updatedDocument.documentUrl,
      status: updatedDocument.status,
      comment: request.comment || null,
      action: DocumentAction.UPDATED,
      updatedBy: request.updatedBy || 'system',
    };

    try {
      await this.documentHistoryRepository.save(historyProps);
    } catch (_err) {
      // ignore history persistence errors to not block document update
    }

    return updatedDocument;
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
