import { Request, Response } from 'express';
import { CreateDocumentUseCase } from '../../domains/document/use-cases/create-document.use-case';
import {
  GetDocumentByIdUseCase,
  GetAllDocumentsUseCase,
  GetDocumentsByContractIdUseCase,
  GetDocumentsByTemplateIdUseCase,
  GetDocumentsByColaboratorIdUseCase,
  GetExpiredDocumentsUseCase,
  GetExpiringDocumentsUseCase,
} from '../../domains/document/use-cases/get-document.use-case';
import { UpdateDocumentUseCase, DeleteDocumentUseCase } from '../../domains/document/use-cases/update-document.use-case';
import { SendToReviewDocumentUseCase } from '../../domains/document/use-cases/send-to-review-document.use-case';
import { ApproveDocumentUseCase } from '../../domains/document/use-cases/approve-document.use-case';
import { RejectDocumentUseCase } from '../../domains/document/use-cases/reject-document.use-case';
import { RejectDocumentWithCommentsUseCase } from '../../domains/document/use-cases/reject-document-with-comments.use-case';
import { CreateDocumentDto } from '../dto/document/create-document.dto';
import { UpdateDocumentDto } from '../dto/document/update-document.dto';
import { DocumentResponseDto } from '../dto/document/document-response.dto';
import { Document } from '../../domains/document/entities/document.entity';
import { asyncHandler } from '@shared/middleware/validation';
import { ContractReviewerRepository } from '@domains/contract/repositories/contract-reviewer.repository';
import { ReviewerResponseDto } from '../dto/contract/reviewer-response.dto';
import { ContractReviewer } from '@domains/contract/entities/contract-reviewer.entity';
import { GetAllDocumentTypesWithSubtypesUseCase } from '@domains/document-type/use-cases/get-document-type-with-subtypes.use-case';
import { AssignDocumentsFromTemplateToGroupUseCase } from '@domains/document/use-cases/assign-documents-from-template-to-group.use-case';

export class DocumentController {
  constructor(
    private createDocumentUseCase: CreateDocumentUseCase,
    private getDocumentByIdUseCase: GetDocumentByIdUseCase,
    private getAllDocumentsUseCase: GetAllDocumentsUseCase,
    private getDocumentsByContractIdUseCase: GetDocumentsByContractIdUseCase,
    private getDocumentsByTemplateIdUseCase: GetDocumentsByTemplateIdUseCase,
    private getDocumentsByColaboratorIdUseCase: GetDocumentsByColaboratorIdUseCase,
    private getExpiredDocumentsUseCase: GetExpiredDocumentsUseCase,
    private getExpiringDocumentsUseCase: GetExpiringDocumentsUseCase,
    private updateDocumentUseCase: UpdateDocumentUseCase,
    private deleteDocumentUseCase: DeleteDocumentUseCase,
    private sendToReviewDocumentUseCase: SendToReviewDocumentUseCase,
    private approveDocumentUseCase: ApproveDocumentUseCase,
    private rejectDocumentUseCase: RejectDocumentUseCase,
    private rejectDocumentWithCommentsUseCase: RejectDocumentWithCommentsUseCase,
    private contractReviewerRepository: ContractReviewerRepository,
    private getAllDocumentTypesWithSubtypesUseCase: GetAllDocumentTypesWithSubtypesUseCase,
    private assignDocumentsFromTemplateToGroupUseCase: AssignDocumentsFromTemplateToGroupUseCase,
  ) {}

  createDocument = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const dto: CreateDocumentDto = req.body;

    const document = await this.createDocumentUseCase.execute({
      templateId: dto.templateId,
      colaboratorId: dto.colaboratorId,
      name: dto.name,
      issuedDate: new Date(dto.issuedDate),
      expirationDate: dto.expirationDate ? new Date(dto.expirationDate) : undefined,
      contractId: dto.contractId,
      description: dto.description,
      documentUrl: dto.documentUrl,
      createdBy: req.user?.id,
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
    const { includeContractReviewers, includeDocumentTypes } = req.query;
    const documents = await this.getAllDocumentsUseCase.execute();

    const response: any = {
      success: true,
      data: documents.map((doc) => this.toResponseDto(doc)),
      count: documents.length,
    };

    // Si se solicita incluir revisores de contratos
    if (includeContractReviewers === 'true') {
      // Obtener IDs únicos de contratos de los documentos
      const contractIds = [...new Set(
        documents
          .map(doc => doc.contractId)
          .filter((id): id is string => id !== null && id !== undefined),
      )];

      // Obtener revisores solo de esos contratos
      const reviewersMap = await this.contractReviewerRepository.findByContractIds(contractIds);

      // Convertir Map a objeto para serialización JSON
      const contractReviewers: Record<string, ReviewerResponseDto[]> = {};
      for (const [contractId, reviewers] of reviewersMap.entries()) {
        contractReviewers[contractId] = reviewers.map(reviewer => this.toReviewerResponseDto(reviewer));
      }

      response.contractReviewers = contractReviewers;
    }

    // Si se solicita incluir tipos de documentos con subtipos
    if (includeDocumentTypes === 'true') {
      const results = await this.getAllDocumentTypesWithSubtypesUseCase.execute();
      response.documentTypes = results.map(result => ({
        ...result.documentType.toJSON(),
        subtypes: result.subtypes.map(subtype => subtype.toJSON()),
      }));
    }

    res.status(200).json(response);
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

  getDocumentsByTemplateId = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { templateId } = req.params;
    const documents = await this.getDocumentsByTemplateIdUseCase.execute(templateId);
    res.status(200).json({
      success: true,
      data: documents.map((doc) => this.toResponseDto(doc)),
      count: documents.length,
    });
  });

  getDocumentsByColaboratorId = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { colaboratorId } = req.params;
    const documents = await this.getDocumentsByColaboratorIdUseCase.execute(colaboratorId);
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

  assignDocumentsFromTemplateToGroup = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { templateId, contractId, groupId, issuedDate, expirationDate, name, comment } = req.body;
    const result = await this.assignDocumentsFromTemplateToGroupUseCase.execute({
      templateId,
      contractId,
      groupId: Number(groupId),
      issuedDate: issuedDate ? new Date(issuedDate) : undefined,
      expirationDate: expirationDate ? new Date(expirationDate) : undefined,
      name,
      createdBy: req.user?.id,
      comment,
    });

    res.status(201).json({
      success: true,
      data: {
        created: result.created.map(d => this.toResponseDto(d)),
        skipped: result.skipped,
        createdCount: result.created.length,
        skippedCount: result.skipped.length,
      },
      message: 'Asignación masiva completada',
    });
  });

  updateDocument = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const dto: UpdateDocumentDto = req.body;

    const document = await this.updateDocumentUseCase.execute(id, {
      templateId: dto.templateId,
      colaboratorId: dto.colaboratorId,
      name: dto.name,
      issuedDate: dto.issuedDate ? new Date(dto.issuedDate) : undefined,
      expirationDate: dto.expirationDate ? new Date(dto.expirationDate) : undefined,
      contractId: dto.contractId,
      description: dto.description,
      documentUrl: dto.documentUrl,
      updatedBy: req.user?.id,
      comment: dto.comment,
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

  sendToReview = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    await this.sendToReviewDocumentUseCase.execute(id, req.user?.id || 'system');

    // Obtener el documento actualizado
    const document = await this.getDocumentByIdUseCase.execute(id);

    res.status(200).json({
      success: true,
      data: this.toResponseDto(document),
      message: 'Documento enviado a revisión exitosamente',
    });
  });

  approveDocument = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    await this.approveDocumentUseCase.execute(id, req.user?.id || 'system');

    // Obtener el documento actualizado
    const document = await this.getDocumentByIdUseCase.execute(id);

    res.status(200).json({
      success: true,
      data: this.toResponseDto(document),
      message: 'Documento aprobado exitosamente',
    });
  });

  rejectDocument = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    await this.rejectDocumentUseCase.execute(id, req.user?.id || 'system');

    // Obtener el documento actualizado
    const document = await this.getDocumentByIdUseCase.execute(id);

    res.status(200).json({
      success: true,
      data: this.toResponseDto(document),
      message: 'Documento rechazado exitosamente',
    });
  });

  rejectDocumentWithComments = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { comments } = req.body;

    if (!comments || typeof comments !== 'string' || comments.trim() === '') {
      res.status(400).json({
        success: false,
        message: 'Los comentarios son obligatorios',
      });
      return;
    }

    await this.rejectDocumentWithCommentsUseCase.execute(id, req.user?.id || 'system', comments);

    // Obtener el documento actualizado
    const document = await this.getDocumentByIdUseCase.execute(id);

    res.status(200).json({
      success: true,
      data: this.toResponseDto(document),
      message: 'Documento rechazado con comentarios exitosamente',
    });
  });

  private toResponseDto(document: Document): DocumentResponseDto {
    const json = document.toJSON();
    return {
      id: json.id,
      templateId: json.templateId,
      colaboratorId: json.colaboratorId,
      templateName: document.templateName,
      documentTypeName: document.documentTypeName,
      documentSubtypeName: document.documentSubtypeName,
      name: json.name,
      issuedDate: json.issuedDate,
      expirationDate: json.expirationDate ? json.expirationDate : undefined,
      contractId: json.contractId ?? undefined,
      contractNumber: document.contractNumber,
      contractProjectName: document.contractProjectName,
      description: json.description,
      documentUrl: json.documentUrl,
      status: json.status,
      comment: json.comment,
      isExpired: document.isExpired(),
      daysUntilExpiration: document.daysUntilExpiration(),
      createdAt: json.createdAt,
      updatedAt: json.updatedAt,
    };
  }

  private toReviewerResponseDto(reviewer: ContractReviewer): ReviewerResponseDto {
    const json = reviewer.toJSON();
    return {
      id: json.id,
      userId: json.userId,
      contractId: json.contractId,
      isPrimary: json.isPrimary,
      validUntil: json.validUntil,
      isActive: json.isActive,
      createdAt: json.createdAt,
    };
  }
}
