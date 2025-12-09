import { Request, Response } from 'express';
import { asyncHandler } from '@shared/middleware/validation';
import { CreateDocumentTemplateUseCase } from '@domains/document-template/use-cases/create-document-template.use-case';
import { GetDocumentTemplateByIdUseCase, GetAllDocumentTemplatesUseCase } from '@domains/document-template/use-cases/get-document-template.use-case';
import { UpdateDocumentTemplateUseCase, DeleteDocumentTemplateUseCase } from '@domains/document-template/use-cases/update-document-template.use-case';

export class DocumentTemplateController {
  constructor(
    private readonly createTemplateUseCase: CreateDocumentTemplateUseCase,
    private readonly getByIdUseCase: GetDocumentTemplateByIdUseCase,
    private readonly getAllUseCase: GetAllDocumentTemplatesUseCase,
    private readonly updateUseCase: UpdateDocumentTemplateUseCase,
    private readonly deleteUseCase: DeleteDocumentTemplateUseCase,
  ) {}

  public create = asyncHandler(async (req: Request, res: Response) => {
    const template = await this.createTemplateUseCase.execute(req.body);
    res.status(201).json({ success: true, data: template.toJSON(), message: 'Template created successfully' });
  });

  public getById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const template = await this.getByIdUseCase.execute(id);
    res.status(200).json({ success: true, data: template.toJSON() });
  });

  public getAll = asyncHandler(async (req: Request, res: Response) => {
    const templates = await this.getAllUseCase.execute();
    res.status(200).json({ success: true, data: templates.map(t => t.toJSON()), count: templates.length });
  });

  public update = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const template = await this.updateUseCase.execute(id, req.body);
    res.status(200).json({ success: true, data: template.toJSON(), message: 'Template updated successfully' });
  });

  public delete = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.deleteUseCase.execute(id);
    res.status(200).json({ success: true, message: 'Template deleted successfully' });
  });
}
