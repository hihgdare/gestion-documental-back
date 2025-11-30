import { DocumentRepository } from '../repositories/document.repository';
import { DocumentHistoryRepository } from '../repositories/document-history.repository';
import { DocumentHistoryProps } from '../entities/document-history.entity';
import { DocumentAction } from '../value-objects/document-enums';
import { NotFoundError } from '@shared/domain/errors';

export class RejectDocumentUseCase {
  constructor(
    private readonly documentRepository: DocumentRepository,
    private readonly documentHistoryRepository: DocumentHistoryRepository,
  ) {}

  async execute(documentId: string, userId: string): Promise<void> {
    // Buscar el documento
    const document = await this.documentRepository.findById(documentId);
    if (!document) {
      throw new NotFoundError('Documento no encontrado');
    }

    // Cambiar estado a rechazado
    document.reject();

    // Guardar el documento
    await this.documentRepository.save(document);

    // Crear registro en historial
    const historyProps: DocumentHistoryProps = {
      documentId: document.id,
      action: DocumentAction.REJECTED,
      updatedBy: userId,
      documentTypeId: document.documentTypeId,
      documentSubtypeId: document.documentSubtypeId,
      name: document.name,
      issuedDate: document.issuedDate,
      expirationDate: document.expirationDate,
      description: document.description,
      documentUrl: document.documentUrl,
      status: document.status,
      comment: document.comment,
    };

    await this.documentHistoryRepository.save(historyProps);
  }
}
