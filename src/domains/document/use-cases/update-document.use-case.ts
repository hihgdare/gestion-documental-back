import { DocumentRepository } from '../repositories/document.repository';
import { DocumentHistoryRepository } from '../repositories/document-history.repository';
import { Document } from '../entities/document.entity';
import { DocumentHistoryProps } from '../entities/document-history.entity';
import { DocumentAction } from '../value-objects/document-enums';
import { NotFoundError, ValidationError } from '@shared/domain/errors';
import { GroupRepository } from '@domains/group/repositories/group.repository';

export interface UpdateDocumentRequest {
  documentTypeId?: string;
  documentSubtypeId?: string;
  colaboratorIds?: string[];
  name?: string;
  issuedDate?: Date;
  expirationDate?: Date;
  contractId?: string;
  description?: string;
  documentUrl?: string;
  requiredForContract?: boolean;
  requiredForColaborator?: boolean;
  groupId?: number;
  updatedBy?: string;
  comment?: string;
}

export class UpdateDocumentUseCase {
  constructor(
    private readonly documentRepository: DocumentRepository,
    private readonly documentHistoryRepository: DocumentHistoryRepository,
    private readonly groupRepository: GroupRepository,
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

    if (request.documentTypeId !== undefined) {
      document.updateDocumentTypeId(request.documentTypeId);
    }

    if (request.documentSubtypeId !== undefined) {
      document.updateDocumentSubtypeId(request.documentSubtypeId);
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

    if (request.requiredForContract !== undefined) {
      document.updateRequiredForContract(request.requiredForContract);
    }

    if (request.requiredForColaborator !== undefined) {
      document.updateRequiredForColaborator(request.requiredForColaborator);
    }

    // Update group if provided
    if (request.groupId !== undefined && request.groupId !== document.groupId) {
      const group = await this.groupRepository.findById(request.groupId);
      if (!group) {
        throw new ValidationError('Group not found', 'groupId');
      }
      document.changeGroup(request.groupId);
    }

    // Verificar que no haya documentos duplicados
    const finalDocumentTypeId = document.documentTypeId;
    const finalDocumentSubtypeId = document.documentSubtypeId;
    const finalContractId = document.contractId;
    const finalColaboratorIds = document.colaboratorIds;

    if (finalColaboratorIds && finalColaboratorIds.length > 0) {
      let exists = false;
      if (finalContractId) {
        exists = await this.documentRepository.existsByTypeSubtypeContractColaborator(
          finalDocumentTypeId,
          finalDocumentSubtypeId,
          finalContractId,
          finalColaboratorIds,
          document.id,
        );
      } else {
        exists = await this.documentRepository.existsByTypeSubtypeAndColaborator(
          finalDocumentTypeId,
          finalDocumentSubtypeId,
          finalColaboratorIds,
          document.id,
        );
      }

      if (exists) {
        throw new ValidationError(`Ya existe un documento de este tipo para los colaboradores seleccionados${finalContractId ? ' en este contrato' : ''}.`);
      }
    }

    // Al editar un documento, siempre vuelve a estado borrador
    document.setToDraft();

    // Actualizar documento
    const updatedDocument = await this.documentRepository.update(document);

    // Crear entrada de historial
    const historyProps: DocumentHistoryProps = {
      documentId: updatedDocument.id,
      documentTypeId: updatedDocument.documentTypeId,
      documentSubtypeId: updatedDocument.documentSubtypeId,
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

    await this.documentHistoryRepository.save(historyProps).catch(() => {});

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
