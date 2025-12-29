import { IDocumentModelRepository } from '../repositories/document-model.repository.interface';
import { DocumentModel, DocumentModelProps } from '../entities/document-model.entity';
import { IFamilyRepository } from '@domains/family/repositories/family.repository.interface';
import { NotFoundError, ValidationError } from '@shared/domain/errors';

export interface CreateDocumentModelRequest {
  familyId: string;
  documentTypeId: string;
  documentSubtypeId: string;
  requiredForContract?: boolean;
  requiredForColaborator?: boolean;
}

export class CreateDocumentModelUseCase {
  constructor(
    private readonly documentModelRepository: IDocumentModelRepository,
    private readonly familyRepository: IFamilyRepository,
  ) {}

  public async execute(request: CreateDocumentModelRequest): Promise<DocumentModel> {
    // Verify family exists
    const family = await this.familyRepository.findById(request.familyId);
    if (!family) {
      throw new NotFoundError('Familia no encontrada');
    }

    // Check if a model with the same family, type and subtype already exists
    const existing = await this.documentModelRepository.findByFamilyTypeSubtype(
      request.familyId,
      request.documentTypeId,
      request.documentSubtypeId,
    );
    if (existing) {
      throw new ValidationError(
        'Ya existe un modelo de documento con esta combinación de familia, tipo y subtipo',
      );
    }

    // Create document model
    const documentModelProps: DocumentModelProps = {
      familyId: request.familyId,
      documentTypeId: request.documentTypeId,
      documentSubtypeId: request.documentSubtypeId,
      requiredForContract: request.requiredForContract,
      requiredForColaborator: request.requiredForColaborator,
    };

    const documentModel = DocumentModel.create(documentModelProps);

    return await this.documentModelRepository.create(documentModel);
  }
}
