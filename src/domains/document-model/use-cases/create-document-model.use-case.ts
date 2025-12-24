import { IDocumentModelRepository } from '../repositories/document-model.repository.interface';
import { DocumentModel, DocumentModelProps } from '../entities/document-model.entity';
import { IFamilyRepository } from '@domains/family/repositories/family.repository.interface';
import { NotFoundError } from '@shared/domain/errors';

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
