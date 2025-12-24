import { IDocumentModelRepository } from '../repositories/document-model.repository.interface';
import { DocumentModel } from '../entities/document-model.entity';
import { NotFoundError } from '@shared/domain/errors';

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
