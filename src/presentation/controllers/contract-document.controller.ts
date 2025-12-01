import { Request, Response } from 'express';
import { asyncHandler } from '@shared/middleware/validation';
import { GetContractDocumentsRelationUseCase } from '@domains/contract/use-cases/get-contract-documents-relation.use-case';

export class ContractDocumentController {
  constructor(private readonly getContractDocumentsRelationUseCase: GetContractDocumentsRelationUseCase) {}

  public listContractDocuments = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const relations = await this.getContractDocumentsRelationUseCase.execute();
    res.status(200).json({
      success: true,
      data: relations,
      count: relations.length,
    });
  });
}
