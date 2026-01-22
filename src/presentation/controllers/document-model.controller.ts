import { Request, Response } from 'express';
import { CreateDocumentModelUseCase } from '@domains/document-model/use-cases/create-document-model.use-case';
import {
  GetDocumentModelByIdUseCase,
  GetAllDocumentModelsUseCase,
  GetDocumentModelsByFamilyIdUseCase,
} from '@domains/document-model/use-cases/get-document-model.use-case';
import { UpdateDocumentModelUseCase, DeleteDocumentModelUseCase } from '@domains/document-model/use-cases/update-document-model.use-case';
import { asyncHandler } from '@shared/middleware/validation';

export class DocumentModelController {
  constructor(
    private readonly createDocumentModelUseCase: CreateDocumentModelUseCase,
    private readonly getDocumentModelByIdUseCase: GetDocumentModelByIdUseCase,
    private readonly getAllDocumentModelsUseCase: GetAllDocumentModelsUseCase,
    private readonly getDocumentModelsByFamilyIdUseCase: GetDocumentModelsByFamilyIdUseCase,
    private readonly updateDocumentModelUseCase: UpdateDocumentModelUseCase,
    private readonly deleteDocumentModelUseCase: DeleteDocumentModelUseCase,
  ) {}

  public createDocumentModel = asyncHandler(async (req: Request, res: Response) => {
    const documentModel = await this.createDocumentModelUseCase.execute(req.body);
    res.status(201).json({
      success: true,
      data: documentModel.toJSON(),
      message: 'Modelo de documento creado exitosamente',
    });
  });

  public getDocumentModelById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const documentModel = await this.getDocumentModelByIdUseCase.execute(id);
    res.status(200).json({
      success: true,
      data: documentModel.toJSON(),
    });
  });

  public getAllDocumentModels = asyncHandler(async (req: Request, res: Response) => {
    const groupId = req.groupId;
    const documentModels = await this.getAllDocumentModelsUseCase.execute(groupId);
    res.status(200).json({
      success: true,
      data: documentModels.map(model => model.toJSON()),
      count: documentModels.length,
    });
  });

  public getDocumentModelsByFamilyId = asyncHandler(async (req: Request, res: Response) => {
    const { familyId } = req.params;
    const groupId = req.groupId;
    const documentModels = await this.getDocumentModelsByFamilyIdUseCase.execute(familyId, groupId);
    res.status(200).json({
      success: true,
      data: documentModels.map(model => model.toJSON()),
      count: documentModels.length,
    });
  });

  public updateDocumentModel = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const documentModel = await this.updateDocumentModelUseCase.execute(id, req.body);
    res.status(200).json({
      success: true,
      data: documentModel.toJSON(),
      message: 'Modelo de documento actualizado exitosamente',
    });
  });

  public deleteDocumentModel = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.deleteDocumentModelUseCase.execute(id);
    res.status(200).json({
      success: true,
      message: 'Modelo de documento eliminado exitosamente',
    });
  });
}
