import { DocumentHistoryRepository } from '@domains/document/repositories/document-history.repository';
import { DocumentRepository } from '@domains/document/repositories/document.repository';
import { DocumentAction, DocumentStatus } from '@domains/document/value-objects/document-enums';
import { NotFoundError, ValidationError } from '@shared/domain/errors';
import { SignatureFlowParticipant } from '../entities/signature-flow-participant.entity';
import { SignatureFlowRepository } from '../repositories/signature-flow.repository';
import { SignatureFlowParticipantRepository } from '../repositories/signature-flow-participant.repository';
import {
  SignatureFlowOrderType,
  SignatureFlowParticipantRole,
  SignatureFlowParticipantStatus,
  SignatureFlowStatus,
} from '../value-objects/signature-flow-enums';
import { SignatureFlowNotificationService } from '../services/signature-flow-notification.service';

export interface ProcessFlowParticipantActionInput {
  participantId: string;
  actorUserId: string;
  action: 'approve' | 'reject';
  comment?: string;
}

export class ProcessFlowParticipantActionUseCase {
  constructor(
    private readonly flowRepository: SignatureFlowRepository,
    private readonly participantRepository: SignatureFlowParticipantRepository,
    private readonly documentRepository: DocumentRepository,
    private readonly documentHistoryRepository: DocumentHistoryRepository,
    private readonly notificationService: SignatureFlowNotificationService,
  ) {}

  async execute(input: ProcessFlowParticipantActionInput): Promise<void> {
    const participant = await this.participantRepository.findById(input.participantId);
    if (!participant) throw new NotFoundError('Participante del flujo no encontrado');

    if (!participant.userId || participant.userId !== input.actorUserId) {
      throw new ValidationError('No tienes permisos para realizar esta acción en el participante');
    }

    const flow = await this.flowRepository.findById(participant.flowId);
    if (!flow) throw new NotFoundError('Flujo de firma no encontrado');

    const document = await this.documentRepository.findById(flow.documentId);
    if (!document) throw new NotFoundError('Documento no encontrado');

    if (participant.status !== SignatureFlowParticipantStatus.PENDING) {
      throw new ValidationError('El participante no está pendiente de acción');
    }

    if (!this.isParticipantEnabledInCurrentStep(flow.orderType, participant, await this.participantRepository.findByFlowId(flow.id))) {
      throw new ValidationError('Este participante aún no puede actuar por el orden configurado del flujo');
    }

    if (participant.role === SignatureFlowParticipantRole.VALIDATOR) {
      if (flow.status !== SignatureFlowStatus.IN_REVIEW) {
        throw new ValidationError('El flujo no está en etapa de revisión');
      }
      if (input.action === 'approve') {
        participant.status = SignatureFlowParticipantStatus.APPROVED;
      } else {
        participant.status = SignatureFlowParticipantStatus.REJECTED;
        participant.rejectionComment = input.comment?.trim() || null;
      }
    } else {
      if (flow.status !== SignatureFlowStatus.IN_SIGNING) {
        throw new ValidationError('El flujo no está en etapa de firma');
      }
      if (input.action === 'approve') {
        throw new ValidationError('El firmante debe firmar con código de verificación');
      }
      participant.status = SignatureFlowParticipantStatus.REJECTED;
      participant.rejectionComment = input.comment?.trim() || null;
    }

    participant.actionAt = new Date();
    await this.participantRepository.update(participant);

    await this.documentHistoryRepository.save({
      documentId: document.id,
      documentModelId: document.documentModelId,
      name: document.name,
      issuedDate: document.issuedDate ?? undefined,
      expirationDate: document.expirationDate,
      contractId: document.contractId,
      description: document.description,
      documentUrl: document.documentUrl,
      status: document.status,
      action: input.action === 'approve' ? DocumentAction.FLOW_VALIDATED : DocumentAction.FLOW_PARTICIPANT_REJECTED,
      updatedBy: input.actorUserId,
      comment: input.comment?.trim() || null,
      flowParticipantId: participant.id,
      actionComment: input.comment?.trim() || null,
    });

    await this.reconcileFlow(flow.id);
  }

  async markSignerSignedFromOtp(documentId: string, userId: string, signedAt: Date): Promise<void> {
    const flow = await this.flowRepository.findActiveByDocumentId(documentId);
    if (!flow || flow.status !== SignatureFlowStatus.IN_SIGNING) return;

    const participants = await this.participantRepository.findByFlowId(flow.id);
    const participant = participants.find((p) => (
      p.role === SignatureFlowParticipantRole.SIGNER
      && p.userId === userId
      && p.status === SignatureFlowParticipantStatus.PENDING
      && this.isParticipantEnabledInCurrentStep(flow.orderType, p, participants)
    ));

    if (!participant) return;

    participant.status = SignatureFlowParticipantStatus.SIGNED;
    participant.actionAt = signedAt;
    await this.participantRepository.update(participant);

    const document = await this.documentRepository.findById(documentId);
    if (document) {
      await this.documentHistoryRepository.save({
        documentId: document.id,
        documentModelId: document.documentModelId,
        name: document.name,
        issuedDate: document.issuedDate ?? undefined,
        expirationDate: document.expirationDate,
        contractId: document.contractId,
        description: document.description,
        documentUrl: document.documentUrl,
        status: document.status,
        action: DocumentAction.FLOW_SIGNED,
        updatedBy: userId,
        comment: 'Firmante completó la firma con código de verificación',
        flowParticipantId: participant.id,
      });
    }

    await this.reconcileFlow(flow.id);
  }

  async markSignerRejectedFromOtp(documentId: string, userId: string, reason: string): Promise<void> {
    const flow = await this.flowRepository.findActiveByDocumentId(documentId);
    if (!flow) return;

    const participants = await this.participantRepository.findByFlowId(flow.id);
    const participant = participants.find((p) => (
      p.role === SignatureFlowParticipantRole.SIGNER
      && p.userId === userId
      && p.status === SignatureFlowParticipantStatus.PENDING
      && this.isParticipantEnabledInCurrentStep(flow.orderType, p, participants)
    ));

    if (!participant) return;

    participant.status = SignatureFlowParticipantStatus.REJECTED;
    participant.rejectionComment = reason;
    participant.actionAt = new Date();
    await this.participantRepository.update(participant);

    const document = await this.documentRepository.findById(documentId);
    if (document) {
      await this.documentHistoryRepository.save({
        documentId: document.id,
        documentModelId: document.documentModelId,
        name: document.name,
        issuedDate: document.issuedDate ?? undefined,
        expirationDate: document.expirationDate,
        contractId: document.contractId,
        description: document.description,
        documentUrl: document.documentUrl,
        status: document.status,
        action: DocumentAction.FLOW_PARTICIPANT_REJECTED,
        updatedBy: userId,
        comment: reason,
        flowParticipantId: participant.id,
        actionComment: reason,
      });
    }

    await this.reconcileFlow(flow.id);
  }

  private async reconcileFlow(flowId: string): Promise<void> {
    const flow = await this.flowRepository.findById(flowId);
    if (!flow) return;

    const document = await this.documentRepository.findById(flow.documentId);
    if (!document) return;

    const participants = await this.participantRepository.findByFlowId(flow.id);
    const validators = participants.filter((p) => p.role === SignatureFlowParticipantRole.VALIDATOR);
    const signers = participants.filter((p) => p.role === SignatureFlowParticipantRole.SIGNER);

    const hasRejected = participants.some((p) => p.status === SignatureFlowParticipantStatus.REJECTED);
    if (hasRejected) {
      const rejectedParticipants = participants
        .filter((p) => p.status === SignatureFlowParticipantStatus.REJECTED)
        .sort((a, b) => (b.actionAt?.getTime() ?? 0) - (a.actionAt?.getTime() ?? 0));

      const rejectionReason = rejectedParticipants[0]?.rejectionComment?.trim() || 'Sin motivo proporcionado';
      const hasComment = participants.some((p) => !!p.rejectionComment);

      flow.status = SignatureFlowStatus.REJECTED;
      document.status = hasComment ? DocumentStatus.REJECTED_WITH_COMMENTS : DocumentStatus.REJECTED;
      document.comment = hasComment ? rejectionReason : null;

      await this.flowRepository.update(flow);
      await this.documentRepository.update(document);

      await this.documentHistoryRepository.save({
        documentId: document.id,
        documentModelId: document.documentModelId,
        name: document.name,
        issuedDate: document.issuedDate ?? undefined,
        expirationDate: document.expirationDate,
        contractId: document.contractId,
        description: document.description,
        documentUrl: document.documentUrl,
        status: document.status,
        action: DocumentAction.FLOW_REJECTED,
        updatedBy: flow.sentBy || 'system',
        comment: `El flujo fue rechazado por un participante. Motivo: ${rejectionReason}`,
      });

      await this.notificationService.notifyResponsibleOnRejection(
        document.id,
        document.name,
        document.createdBy,
        rejectionReason,
      );
      return;
    }

    const validatorsCompleted = validators.length === 0
      || validators.every((p) => p.status === SignatureFlowParticipantStatus.APPROVED);

    if (flow.status === SignatureFlowStatus.IN_REVIEW && validatorsCompleted) {
      flow.status = SignatureFlowStatus.IN_SIGNING;
      document.status = DocumentStatus.IN_SIGNING;
      await this.flowRepository.update(flow);
      await this.documentRepository.update(document);

      await this.documentHistoryRepository.save({
        documentId: document.id,
        documentModelId: document.documentModelId,
        name: document.name,
        issuedDate: document.issuedDate ?? undefined,
        expirationDate: document.expirationDate,
        contractId: document.contractId,
        description: document.description,
        documentUrl: document.documentUrl,
        status: document.status,
        action: DocumentAction.FLOW_VALIDATED,
        updatedBy: flow.sentBy || 'system',
        comment: 'Validación completada. Documento enviado a etapa de firma',
      });

      const pendingSigners = signers.filter((p) => p.status === SignatureFlowParticipantStatus.PENDING);
      await this.notificationService.notifyParticipantsForCurrentStep(pendingSigners, document.id, document.name, flow.orderType);
      return;
    }

    const allSignersSigned = signers.length > 0
      && signers.every((p) => p.status === SignatureFlowParticipantStatus.SIGNED);

    if (flow.status === SignatureFlowStatus.IN_SIGNING && allSignersSigned) {
      flow.status = SignatureFlowStatus.SIGNED;
      document.status = DocumentStatus.SIGNED;
      await this.flowRepository.update(flow);
      await this.documentRepository.update(document);

      await this.documentHistoryRepository.save({
        documentId: document.id,
        documentModelId: document.documentModelId,
        name: document.name,
        issuedDate: document.issuedDate ?? undefined,
        expirationDate: document.expirationDate,
        contractId: document.contractId,
        description: document.description,
        documentUrl: document.documentUrl,
        status: document.status,
        action: DocumentAction.FLOW_COMPLETED,
        updatedBy: flow.sentBy || 'system',
        comment: 'Todos los firmantes completaron la firma',
      });
    }
  }

  private isParticipantEnabledInCurrentStep(
    orderType: SignatureFlowOrderType,
    participant: SignatureFlowParticipant,
    participants: SignatureFlowParticipant[],
  ): boolean {
    if (orderType !== SignatureFlowOrderType.SEQUENTIAL) return true;
    if (participant.order === null) return true;

    const pendingSameRole = participants
      .filter((p) => p.role === participant.role && p.status === SignatureFlowParticipantStatus.PENDING && p.order !== null)
      .map((p) => p.order as number);

    if (pendingSameRole.length === 0) return true;

    return participant.order === Math.min(...pendingSameRole);
  }
}
