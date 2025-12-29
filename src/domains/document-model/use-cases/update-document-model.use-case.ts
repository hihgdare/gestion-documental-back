import { IDocumentModelRepository } from '../repositories/document-model.repository.interface';
import { DocumentModel } from '../entities/document-model.entity';
import { NotFoundError, ValidationError } from '@shared/domain/errors';

export interface UpdateDocumentModelRequest {
  documentTypeId?: string;
  documentSubtypeId?: string;
  requiredForContract?: boolean;
  requiredForColaborator?: boolean;
}

export class UpdateDocumentModelUseCase {
  constructor(private readonly documentModelRepository: IDocumentModelRepository) {}

  public async execute(id: string, request: UpdateDocumentModelRequest): Promise<DocumentModel> {
    const documentModel = await this.documentModelRepository.findById(id);
    if (!documentModel) {
      throw new NotFoundError('Modelo de documento no encontrado');
    }

    // If updating type or subtype, check for duplicates
    if (request.documentTypeId || request.documentSubtypeId) {
      const newTypeId = request.documentTypeId || documentModel.documentTypeId;
      const newSubtypeId = request.documentSubtypeId || documentModel.documentSubtypeId;

      // Only check if the combination is actually changing
      if (
        newTypeId !== documentModel.documentTypeId ||
        newSubtypeId !== documentModel.documentSubtypeId
      ) {
        const existing = await this.documentModelRepository.findByFamilyTypeSubtype(
          documentModel.familyId,
          newTypeId,
          newSubtypeId,
        );

        if (existing && existing.id !== id) {
          throw new ValidationError(
            'Ya existe un modelo de documento con esta combinación de familia, tipo y subtipo',
          );
        }
      }
    }

    documentModel.update(request);

    return await this.documentModelRepository.update(documentModel);
  }
}

export class DeleteDocumentModelUseCase {
  constructor(private readonly documentModelRepository: IDocumentModelRepository) {}

  public async execute(id: string): Promise<void> {
    const documentModel = await this.documentModelRepository.findById(id);
    if (!documentModel) {
      throw new NotFoundError('Modelo de documento no encontrado');
    }

    await this.documentModelRepository.softDelete(id);
  }
}
