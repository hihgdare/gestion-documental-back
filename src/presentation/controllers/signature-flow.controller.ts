import { Request, Response } from 'express';
import { asyncHandler } from '@shared/middleware/validation';
import { CreateSignatureFlowUseCase } from '@domains/signature-flow/use-cases/create-signature-flow.use-case';
import {
  GetSignatureFlowByIdUseCase,
  GetSignatureFlowsByDocumentIdUseCase,
  GetSignatureFlowParticipantsByFlowIdUseCase,
  GetMyPendingSignatureTasksUseCase,
  GetPendingSignatureDocumentsReportUseCase,
  GetSignatureProcessTimeReportUseCase,
} from '@domains/signature-flow/use-cases/get-signature-flow.use-case';
import {
  UpdateSignatureFlowUseCase,
  AddParticipantToFlowUseCase,
  RemoveParticipantFromFlowUseCase,
  DeleteSignatureFlowUseCase,
} from '@domains/signature-flow/use-cases/update-signature-flow.use-case';
import { ProcessFlowParticipantActionUseCase } from '@domains/signature-flow/use-cases/progress-signature-flow.use-case';
import { SignatureFlow } from '@domains/signature-flow/entities/signature-flow.entity';
import { SignatureFlowParticipant } from '@domains/signature-flow/entities/signature-flow-participant.entity';

export class SignatureFlowController {
  constructor(
    private readonly createSignatureFlowUseCase: CreateSignatureFlowUseCase,
    private readonly getSignatureFlowByIdUseCase: GetSignatureFlowByIdUseCase,
    private readonly getSignatureFlowsByDocumentIdUseCase: GetSignatureFlowsByDocumentIdUseCase,
    private readonly getSignatureFlowParticipantsByFlowIdUseCase: GetSignatureFlowParticipantsByFlowIdUseCase,
    private readonly getMyPendingSignatureTasksUseCase: GetMyPendingSignatureTasksUseCase,
    private readonly getPendingSignatureDocumentsReportUseCase: GetPendingSignatureDocumentsReportUseCase,
    private readonly getSignatureProcessTimeReportUseCase: GetSignatureProcessTimeReportUseCase,
    private readonly updateSignatureFlowUseCase: UpdateSignatureFlowUseCase,
    private readonly addParticipantToFlowUseCase: AddParticipantToFlowUseCase,
    private readonly removeParticipantFromFlowUseCase: RemoveParticipantFromFlowUseCase,
    private readonly processFlowParticipantActionUseCase: ProcessFlowParticipantActionUseCase,
    private readonly deleteSignatureFlowUseCase: DeleteSignatureFlowUseCase,
  ) {}

  create = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.auth!.user!.id;
    const { documentId, orderType, participants } = req.body;

    const flow = await this.createSignatureFlowUseCase.execute({
      documentId,
      orderType,
      sentBy: userId,
      participants,
    });

    res.status(201).json({ success: true, data: this.flowToDto(flow) });
  });

  getById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const flow = await this.getSignatureFlowByIdUseCase.execute(id);
    res.status(200).json({ success: true, data: this.flowToDto(flow) });
  });

  getByDocument = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { documentId } = req.params;
    const flows = await this.getSignatureFlowsByDocumentIdUseCase.execute(documentId);
    res.status(200).json({ success: true, data: flows.map((f) => this.flowToDto(f)), count: flows.length });
  });

  getParticipants = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const participants = await this.getSignatureFlowParticipantsByFlowIdUseCase.execute(id);
    res.status(200).json({ success: true, data: participants.map((p) => this.participantToDto(p)), count: participants.length });
  });

  getMyPending = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.auth!.user!.id;
    const groupId = req.auth?.groupId;
    const tasks = await this.getMyPendingSignatureTasksUseCase.execute(userId, groupId);
    res.status(200).json({
      success: true,
      data: tasks.map((task) => ({
        participantId: task.participantId,
        flowId: task.flowId,
        role: task.role,
        order: task.order,
        document: {
          id: task.documentId,
          name: task.documentName,
          status: task.documentStatus,
          typeName: task.documentTypeName,
          subtypeName: task.documentSubtypeName,
          contractNumber: task.contractNumber,
        },
        sentAt: task.sentAt?.toISOString() ?? null,
        sentByName: task.sentByName,
      })),
      count: tasks.length,
    });
  });

  getPendingDocumentsReport = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const groupId = req.auth?.groupId;
    const items = await this.getPendingSignatureDocumentsReportUseCase.execute(groupId);

    res.status(200).json({
      success: true,
      data: items.map((item) => ({
        flowId: item.flowId,
        document: {
          id: item.documentId,
          name: item.documentName,
          status: item.documentStatus,
          typeName: item.documentTypeName,
          subtypeName: item.documentSubtypeName,
          contractNumber: item.contractNumber,
        },
        sentAt: item.sentAt?.toISOString() ?? null,
        sentByName: item.sentByName,
        currentHolders: item.currentHolders,
      })),
      count: items.length,
    });
  });

  getSigningTimeReport = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const groupId = req.auth?.groupId;
    const items = await this.getSignatureProcessTimeReportUseCase.execute(groupId);

    res.status(200).json({
      success: true,
      data: items.map((item) => ({
        flowId: item.flowId,
        documentId: item.documentId,
        documentName: item.documentName,
        sentAt: item.sentAt.toISOString(),
        signedAt: item.signedAt.toISOString(),
        elapsedDays: item.elapsedDays,
      })),
      count: items.length,
    });
  });

  update = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { orderType } = req.body;
    const flow = await this.updateSignatureFlowUseCase.execute({ id, orderType });
    res.status(200).json({ success: true, data: this.flowToDto(flow) });
  });

  addParticipant = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { userId, colaboratorId, externalName, externalEmail, role, order } = req.body;
    const participant = await this.addParticipantToFlowUseCase.execute({
      flowId: id,
      userId,
      colaboratorId,
      externalName,
      externalEmail,
      role,
      order,
    });
    res.status(201).json({ success: true, data: this.participantToDto(participant) });
  });

  removeParticipant = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { participantId } = req.params;
    await this.removeParticipantFromFlowUseCase.execute(participantId);
    res.status(200).json({ success: true, message: 'Participante eliminado' });
  });

  processParticipantAction = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { participantId } = req.params;
    const { action, comment } = req.body;
    const actorUserId = req.auth!.user!.id;

    await this.processFlowParticipantActionUseCase.execute({
      participantId,
      actorUserId,
      action,
      comment,
    });

    res.status(200).json({ success: true, message: 'Acción aplicada correctamente' });
  });

  delete = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    await this.deleteSignatureFlowUseCase.execute(id);
    res.status(200).json({ success: true, message: 'Flujo de firma eliminado' });
  });

  private flowToDto(flow: SignatureFlow) {
    return {
      id: flow.id,
      documentId: flow.documentId,
      orderType: flow.orderType,
      status: flow.status,
      sentAt: flow.sentAt?.toISOString() ?? null,
      sentBy: flow.sentBy,
      createdAt: flow.createdAt.toISOString(),
      updatedAt: flow.updatedAt.toISOString(),
    };
  }

  private participantToDto(p: SignatureFlowParticipant) {
    return {
      id: p.id,
      flowId: p.flowId,
      userId: p.userId,
      colaboratorId: p.colaboratorId,
      externalName: p.externalName,
      externalEmail: p.externalEmail,
      role: p.role,
      order: p.order,
      status: p.status,
      actionAt: p.actionAt?.toISOString() ?? null,
      rejectionComment: p.rejectionComment,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    };
  }
}
