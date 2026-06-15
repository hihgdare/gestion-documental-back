import { DocumentRepository } from '../repositories/document.repository';
import { DocumentHistoryRepository } from '../repositories/document-history.repository';
import { DocumentFieldValueRepository } from '../repositories/document-field-value.repository';
import { Document, DocumentProps, DocumentFieldValue } from '../entities/document.entity';
import { DocumentHistoryProps } from '../entities/document-history.entity';
import { DocumentAction } from '../value-objects/document-enums';
import { ValidationError } from '@shared/domain/errors';
import { GroupRepository } from '@domains/group/repositories/group.repository';
import { IFamilyRepository } from '@domains/family/repositories/family.repository.interface';
import { IDocumentModelRepository } from '@domains/document-model/repositories/document-model.repository.interface';

export interface CreateDocumentRequest {
  documentModelId: string;
  colaboratorIds?: string[];
  name: string;
  issuedDate?: Date;
  expirationDate?: Date;
  description?: string;
  documentUrl?: string;
  groupId: number;
  requiredColaboratorsCount?: number;
  createdBy?: string;
  comment?: string;
  templateId?: string;
  fieldValues?: DocumentFieldValue[];
}

export class CreateDocumentUseCase {
  constructor(
    private readonly documentRepository: DocumentRepository,
    private readonly documentHistoryRepository: DocumentHistoryRepository,
    private readonly groupRepository: GroupRepository,
    private readonly documentModelRepository: IDocumentModelRepository,
    private readonly familyRepository: IFamilyRepository,
    private readonly documentFieldValueRepository?: DocumentFieldValueRepository,
  ) {}

  public async execute(request: CreateDocumentRequest): Promise<Document> {
    // Validate group exists
    const group = await this.groupRepository.findById(request.groupId);
    if (!group) {
      throw new ValidationError('Group not found', 'groupId');
    }

    // Validate Document Model exists
    const documentModel = await this.documentModelRepository.findById(request.documentModelId);
    if (!documentModel) {
      throw new ValidationError('Document Model not found', 'documentModelId');
    }

    // Get Family and Contract
    const family = await this.familyRepository.findById(documentModel.familyId);
    if (!family) {
      throw new ValidationError('Family associated with model not found');
    }
    const contractId = family.contractId;

    // Verificando que no haya documentos duplicados
    if (request.colaboratorIds && request.colaboratorIds.length > 0) {
      const exists = await this.documentRepository.existsByModelContractColaborator(
        request.documentModelId,
        contractId,
        request.colaboratorIds,
        request.name,
      );

      if (exists) {
        throw new ValidationError('Ya existe un documento con el mismo nombre, modelo y colaboradores en este contrato.');
      }
    }

    // Validate required expiration date based on model
    if (request.documentUrl && request.documentUrl.trim().length > 0) {
      if (documentModel.requiredExpirationDate && !request.expirationDate) {
        throw new ValidationError('La fecha de expiración es requerida para este documento');
      }
    }

    // Creando documento
    const documentProps: DocumentProps = {
      documentModelId: request.documentModelId,
      colaboratorIds: request.colaboratorIds,
      name: request.name,
      issuedDate: request.issuedDate,
      expirationDate: request.expirationDate,
      contractId: contractId,
      description: request.description,
      documentUrl: request.documentUrl,
      groupId: request.groupId,
      requiredColaboratorsCount: request.requiredColaboratorsCount,
      createdBy: request.createdBy,
      templateId: request.templateId,
    };

    const document = Document.create(documentProps);

    // Guardando documento
    const savedDocument = await this.documentRepository.save(document);

    // Guardando valores de campos de plantilla
    if (this.documentFieldValueRepository && request.fieldValues && request.fieldValues.length > 0) {
      await this.documentFieldValueRepository.saveMany(savedDocument.id, request.fieldValues);
    }

    // Creando entrada de historial cuando el contexto del usuario está disponible
    if (request.createdBy && request.createdBy !== 'system') {
      const historyProps: DocumentHistoryProps = {
        documentId: savedDocument.id,
        documentModelId: savedDocument.documentModelId || request.documentModelId,
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
        updatedAt: new Date(),
      };

      await this.documentHistoryRepository.save(historyProps);
    }

    return savedDocument;
  }
}
