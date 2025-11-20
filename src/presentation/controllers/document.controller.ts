import { Request, Response } from 'express';
import { CreateDocumentUseCase } from '../../domains/document/use-cases/create-document.use-case';
import {
  GetDocumentByIdUseCase,
  GetAllDocumentsUseCase,
  GetDocumentsByContractIdUseCase,
  GetDocumentsByDocumentTypeIdUseCase,
  GetDocumentsByDocumentSubtypeIdUseCase,
  GetExpiredDocumentsUseCase,
  GetExpiringDocumentsUseCase,
} from '../../domains/document/use-cases/get-document.use-case';
import { UpdateDocumentUseCase, DeleteDocumentUseCase } from '../../domains/document/use-cases/update-document.use-case';
import { CreateDocumentDto } from '../dto/document/create-document.dto';
import { UpdateDocumentDto } from '../dto/document/update-document.dto';
import { DocumentResponseDto } from '../dto/document/document-response.dto';
import { Document } from '../../domains/document/entities/document.entity';
import { asyncHandler } from '@shared/middleware/validation';

export class DocumentController {
  constructor(
    private createDocumentUseCase: CreateDocumentUseCase,
    private getDocumentByIdUseCase: GetDocumentByIdUseCase,
    private getAllDocumentsUseCase: GetAllDocumentsUseCase,
    private getDocumentsByContractIdUseCase: GetDocumentsByContractIdUseCase,
    private getDocumentsByDocumentTypeIdUseCase: GetDocumentsByDocumentTypeIdUseCase,
    private getDocumentsByDocumentSubtypeIdUseCase: GetDocumentsByDocumentSubtypeIdUseCase,
    private getExpiredDocumentsUseCase: GetExpiredDocumentsUseCase,
    private getExpiringDocumentsUseCase: GetExpiringDocumentsUseCase,
    private updateDocumentUseCase: UpdateDocumentUseCase,
    private deleteDocumentUseCase: DeleteDocumentUseCase,
  ) {}

  createDocument = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const dto: CreateDocumentDto = req.body;

    const document = await this.createDocumentUseCase.execute({
      documentTypeId: dto.documentTypeId,
      documentSubtypeId: dto.documentSubtypeId,
      name: dto.name,
      issuedDate: new Date(dto.issuedDate),
      expirationDate: dto.expirationDate ? new Date(dto.expirationDate) : undefined,
      contractId: dto.contractId,
      description: dto.description,
      documentUrl: dto.documentUrl,
    });

    res.status(201).json({
      success: true,
      data: this.toResponseDto(document),
      message: 'Document created successfully',
    });
  });

  getDocumentById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const document = await this.getDocumentByIdUseCase.execute(id);
    res.status(200).json({
      success: true,
      data: this.toResponseDto(document),
    });
  });

  getAllDocuments = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const documents = await this.getAllDocumentsUseCase.execute();
    res.status(200).json({
      success: true,
      data: documents.map((doc) => this.toResponseDto(doc)),
      count: documents.length,
    });
  });

  getDocumentsByContractId = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { contractId } = req.params;
    const documents = await this.getDocumentsByContractIdUseCase.execute(contractId);
    res.status(200).json({
      success: true,
      data: documents.map((doc) => this.toResponseDto(doc)),
      count: documents.length,
    });
  });

  getDocumentsByDocumentTypeId = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { documentTypeId } = req.params;
    const documents = await this.getDocumentsByDocumentTypeIdUseCase.execute(documentTypeId);
    res.status(200).json({
      success: true,
      data: documents.map((doc) => this.toResponseDto(doc)),
      count: documents.length,
    });
  });

  getDocumentsByDocumentSubtypeId = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { documentSubtypeId } = req.params;
    const documents = await this.getDocumentsByDocumentSubtypeIdUseCase.execute(documentSubtypeId);
    res.status(200).json({
      success: true,
      data: documents.map((doc) => this.toResponseDto(doc)),
      count: documents.length,
    });
  });

  getExpiredDocuments = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const documents = await this.getExpiredDocumentsUseCase.execute();
    res.status(200).json({
      success: true,
      data: documents.map((doc) => this.toResponseDto(doc)),
      count: documents.length,
    });
  });

  getExpiringDocuments = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { days } = req.params;
    const documents = await this.getExpiringDocumentsUseCase.execute(parseInt(days, 10));
    res.status(200).json({
      success: true,
      data: documents.map((doc) => this.toResponseDto(doc)),
      count: documents.length,
    });
  });

  updateDocument = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const dto: UpdateDocumentDto = req.body;

    const document = await this.updateDocumentUseCase.execute(id, {
      documentTypeId: dto.documentTypeId,
      documentSubtypeId: dto.documentSubtypeId,
      name: dto.name,
      issuedDate: dto.issuedDate ? new Date(dto.issuedDate) : undefined,
      expirationDate: dto.expirationDate ? new Date(dto.expirationDate) : undefined,
      description: dto.description,
      documentUrl: dto.documentUrl,
    });

    res.status(200).json({
      success: true,
      data: this.toResponseDto(document),
      message: 'Document updated successfully',
    });
  });

  deleteDocument = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    await this.deleteDocumentUseCase.execute(id);
    res.status(200).json({
      success: true,
      message: 'Document deleted successfully',
    });
  });

  private toResponseDto(document: Document): DocumentResponseDto {
    const json = document.toJSON();
    return {
      id: json.id,
      documentTypeId: json.documentTypeId,
      documentSubtypeId: json.documentSubtypeId,
      name: json.name,
      issuedDate: json.issuedDate.toISOString(),
      expirationDate: json.expirationDate?.toISOString(),
      contractId: json.contractId,
      description: json.description,
      documentUrl: json.documentUrl,
      isExpired: document.isExpired(),
      daysUntilExpiration: document.daysUntilExpiration(),
      createdAt: json.createdAt.toISOString(),
      updatedAt: json.updatedAt.toISOString(),
    };
  }
}
