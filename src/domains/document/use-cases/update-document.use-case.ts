import { DocumentRepository } from '../repositories/document.repository';
import { DocumentHistoryRepository } from '../repositories/document-history.repository';
import { DocumentFieldValueRepository } from '../repositories/document-field-value.repository';
import { Document, DocumentFieldValue } from '../entities/document.entity';
import { DocumentHistoryProps } from '../entities/document-history.entity';
import { DocumentAction } from '../value-objects/document-enums';
import { NotFoundError, ValidationError } from '@shared/domain/errors';
import { GroupRepository } from '@domains/group/repositories/group.repository';
import { IDocumentModelRepository } from '@domains/document-model/repositories/document-model.repository.interface';

export interface UpdateDocumentRequest {
  documentModelId?: string;
  colaboratorIds?: string[];
  name?: string;
  issuedDate?: Date;
  expirationDate?: Date;
  contractId?: string;
  description?: string;
  documentUrl?: string;
  groupId?: number;
  requiredColaboratorsCount?: number;
  updatedBy?: string;
  comment?: string;
  templateId?: string;
  fieldValues?: DocumentFieldValue[];
}

interface DocumentChangeDetail {
  field: string;
  label: string;
  before: string | null;
  after: string | null;
  beforeFileId?: string;
  afterFileId?: string;
}

export class UpdateDocumentUseCase {
  constructor(
    private readonly documentRepository: DocumentRepository,
    private readonly documentHistoryRepository: DocumentHistoryRepository,
    private readonly groupRepository: GroupRepository,
    private readonly documentModelRepository: IDocumentModelRepository,
    private readonly documentFieldValueRepository?: DocumentFieldValueRepository,
  ) {}

  public async execute(id: string, request: UpdateDocumentRequest): Promise<Document> {
    const document = await this.documentRepository.findById(id);
    if (!document) {
      throw new NotFoundError('Documento', id);
    }

    const previousState = {
      name: document.name,
      documentModelId: document.documentModelId,
      issuedDate: document.issuedDate,
      expirationDate: document.expirationDate,
      contractId: document.contractId,
      description: document.description || null,
      documentUrl: document.documentUrl || null,
      groupId: document.groupId,
      requiredColaboratorsCount: document.requiredColaboratorsCount,
      colaboratorIds: [...document.colaboratorIds].sort(),
    };

    // Update fields
    if (request.name !== undefined) {
      document.updateName(request.name);
    }

    if (request.documentModelId !== undefined) {
      // Validate new model exists
      const model = await this.documentModelRepository.findById(request.documentModelId);
      if (!model) {
        throw new ValidationError('Document Model not found', 'documentModelId');
      }
      document.updateDocumentModelId(request.documentModelId);
    }

    if (request.colaboratorIds !== undefined) {
      document.updateColaborators(request.colaboratorIds);
    }

    // Load model to check validation rules (either new model or existing one)
    const currentModelId = request.documentModelId || document.documentModelId;
    const documentModel = await this.documentModelRepository.findById(currentModelId);
    if (!documentModel) {
      throw new ValidationError('Document Model not found for the document', 'documentModelId');
    }

    if (request.issuedDate !== undefined || request.expirationDate !== undefined) {
      document.updateDates(
        request.issuedDate || document.issuedDate,
        request.expirationDate !== undefined ? request.expirationDate : (document.expirationDate || undefined),
        documentModel.requiredExpirationDate,
      );
    }

    if (request.description !== undefined) {
      document.updateDescription(request.description);
    }

    if (request.documentUrl !== undefined) {
      // Keep old file available for history preview when replacing it.
      document.updateDocumentUrl(request.documentUrl);
    }

    if (request.contractId !== undefined) {
      document.updateContractId(request.contractId);
    }

    // Update group if provided
    if (request.groupId !== undefined && request.groupId !== document.groupId) {
      const group = await this.groupRepository.findById(request.groupId);
      if (!group) {
        throw new ValidationError('Group not found', 'groupId');
      }
      document.changeGroup(request.groupId);
    }

    // Update required colaborators count if provided
    if (request.requiredColaboratorsCount !== undefined) {
      document.updateRequiredColaboratorsCount(request.requiredColaboratorsCount);
    }

    // Verificar que no haya documentos duplicados
    const finalDocumentModelId = document.documentModelId;
    const finalContractId = document.contractId;
    const finalColaboratorIds = document.colaboratorIds;

    if (finalColaboratorIds && finalColaboratorIds.length > 0) {
      let exists = false;
      if (finalContractId) {
        exists = await this.documentRepository.existsByModelContractColaborator(
          finalDocumentModelId,
          finalContractId,
          finalColaboratorIds,
          document.id,
        );
      } else {
        exists = await this.documentRepository.existsByModelAndColaborator(
          finalDocumentModelId,
          finalColaboratorIds,
          document.id,
        );
      }

      if (exists) {
        throw new ValidationError(`Ya existe un documento de este modelo para los colaboradores seleccionados${finalContractId ? ' en este contrato' : ''}.`);
      }
    }

    // Al editar un documento, siempre vuelve a estado borrador
    document.setToDraft();

    // Actualizar documento
    const updatedDocument = await this.documentRepository.update(document);

    // Actualizar valores de campos de plantilla si se proporcionaron
    if (this.documentFieldValueRepository && request.fieldValues !== undefined) {
      await this.documentFieldValueRepository.deleteByDocumentId(updatedDocument.id);
      if (request.fieldValues.length > 0) {
        await this.documentFieldValueRepository.saveMany(updatedDocument.id, request.fieldValues);
      }
    }

    // Crear entrada de historial
    const changeDetails: DocumentChangeDetail[] = [];

    const pushChange = (field: string, label: string, before: string | null, after: string | null) => {
      if (before === after) return;
      changeDetails.push({ field, label, before, after });
    };

    const formatDate = (date?: Date | null): string | null => (date ? date.toISOString().slice(0, 10) : null);

    pushChange('name', 'Nombre', previousState.name, updatedDocument.name);
    pushChange('documentModelId', 'Modelo de documento', previousState.documentModelId, updatedDocument.documentModelId);
    pushChange('issuedDate', 'Fecha de emision', formatDate(previousState.issuedDate), formatDate(updatedDocument.issuedDate));
    pushChange('expirationDate', 'Fecha de vencimiento', formatDate(previousState.expirationDate), formatDate(updatedDocument.expirationDate));
    pushChange('contractId', 'Contrato', previousState.contractId, updatedDocument.contractId);
    pushChange('description', 'Descripcion', previousState.description, updatedDocument.description || null);
    pushChange('groupId', 'Grupo', String(previousState.groupId), String(updatedDocument.groupId));
    pushChange(
      'requiredColaboratorsCount',
      'Cantidad requerida de colaboradores',
      String(previousState.requiredColaboratorsCount),
      String(updatedDocument.requiredColaboratorsCount),
    );

    const previousColaborators = previousState.colaboratorIds.join(',');
    const currentColaborators = [...updatedDocument.colaboratorIds].sort().join(',');
    pushChange('colaboratorIds', 'Colaboradores', previousColaborators || null, currentColaborators || null);

    if (previousState.documentUrl !== (updatedDocument.documentUrl || null)) {
      changeDetails.push({
        field: 'documentUrl',
        label: 'Archivo',
        before: previousState.documentUrl ? 'Archivo anterior' : null,
        after: updatedDocument.documentUrl ? 'Archivo reemplazado' : null,
        beforeFileId: previousState.documentUrl || undefined,
        afterFileId: updatedDocument.documentUrl || undefined,
      });
    }

    const historyProps: DocumentHistoryProps = {
      documentId: updatedDocument.id,
      documentModelId: updatedDocument.documentModelId || document.documentModelId,
      name: updatedDocument.name,
      issuedDate: updatedDocument.issuedDate,
      expirationDate: updatedDocument.expirationDate,
      contractId: updatedDocument.contractId,
      description: updatedDocument.description,
      documentUrl: updatedDocument.documentUrl,
      status: updatedDocument.status,
      comment: request.comment || null,
      actionComment: changeDetails.length > 0 ? JSON.stringify({ changes: changeDetails }) : null,
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
