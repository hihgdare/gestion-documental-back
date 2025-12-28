import { DocumentRepository } from '../repositories/document.repository';
import { DocumentHistoryRepository } from '../repositories/document-history.repository';
import { Document, DocumentProps } from '../entities/document.entity';
import { DocumentHistoryProps } from '../entities/document-history.entity';
import { DocumentAction } from '../value-objects/document-enums';
import { ValidationError } from '@shared/domain/errors';

export interface CreateDocumentRequest {
  documentTypeId: string;
  documentSubtypeId: string;
  colaboratorIds?: string[];
  name: string;
  issuedDate?: Date;
  expirationDate?: Date;
  contractId?: string;
  description?: string;
  documentUrl?: string;
  requiredForContract?: boolean;
  requiredForColaborator?: boolean;
  createdBy?: string;
  comment?: string;
}

export class CreateDocumentUseCase {
  constructor(
    private readonly documentRepository: DocumentRepository,
    private readonly documentHistoryRepository: DocumentHistoryRepository,
  ) {}

  public async execute(request: CreateDocumentRequest): Promise<Document> {
    // Verificando que no haya documentos duplicados
    if (request.colaboratorIds && request.colaboratorIds.length > 0) {
      let exists = false;
      if (request.contractId) {
        exists = await this.documentRepository.existsByTypeSubtypeContractColaborator(
          request.documentTypeId,
          request.documentSubtypeId,
          request.contractId,
          request.colaboratorIds,
        );
      } else {
        exists = await this.documentRepository.existsByTypeSubtypeAndColaborator(
          request.documentTypeId,
          request.documentSubtypeId,
          request.colaboratorIds,
        );
      }

      if (exists) {
        throw new ValidationError(`Ya existe un documento de este tipo para los colaboradores seleccionados${request.contractId ? ' en este contrato' : ''}.`);
      }
    }

    // Creando documento
    const documentProps: DocumentProps = {
      documentTypeId: request.documentTypeId,
      documentSubtypeId: request.documentSubtypeId,
      colaboratorIds: request.colaboratorIds,
      name: request.name,
      issuedDate: request.issuedDate,
      expirationDate: request.expirationDate,
      contractId: request.contractId,
      description: request.description,
      documentUrl: request.documentUrl,
      requiredForContract: request.requiredForContract,
      requiredForColaborator: request.requiredForColaborator,
      createdBy: request.createdBy,
    };

    const document = Document.create(documentProps);

    // Guardando documento
    const savedDocument = await this.documentRepository.save(document);

    // Creando entrada de historial cuando el contexto del usuario está disponible
    if (request.createdBy && request.createdBy !== 'system') {
      const historyProps: DocumentHistoryProps = {
        documentId: savedDocument.id,
        documentTypeId: savedDocument.documentTypeId,
        documentSubtypeId: savedDocument.documentSubtypeId,
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
