import { DocumentHistoryRepository } from '@domains/document/repositories/document-history.repository';
import { DocumentRepository } from '@domains/document/repositories/document.repository';
import { DocumentAction, DocumentStatus } from '@domains/document/value-objects/document-enums';
import { InAppNotification } from '@domains/notification/entities/in-app-notification.entity';
import { InAppNotificationRepository } from '@domains/notification/repositories/in-app-notification.repository';
import { UserRepository } from '@domains/user/repositories/user.repository';
import { EmailService } from '@shared/infrastructure/email/email-service.interface';
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
import {
  buildFrontendUrl,
  buildPrimactaNotificationEmail,
} from '@shared/infrastructure/email/templates/primacta-notification-email.template';

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
    private readonly userRepository: UserRepository,
    private readonly inAppNotificationRepository: InAppNotificationRepository,
    private readonly emailService: EmailService,
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
        .sort((a, b) => {
          const aTime = a.actionAt?.getTime() ?? 0;
          const bTime = b.actionAt?.getTime() ?? 0;
          return bTime - aTime;
        });

      const rejectionReason = rejectedParticipants[0]?.rejectionComment?.trim()
        || 'Sin motivo proporcionado';

      flow.status = SignatureFlowStatus.REJECTED;
      document.status = participants.some((p) => !!p.rejectionComment)
        ? DocumentStatus.REJECTED_WITH_COMMENTS
        : DocumentStatus.REJECTED;

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

      await this.notifyResponsibleOnRejection(
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

      await this.notifyParticipantsForCurrentStep(document.id, document.name, flow.orderType, signers);
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

  private async notifyParticipantsForCurrentStep(
    documentId: string,
    documentName: string,
    orderType: SignatureFlowOrderType,
    participants: SignatureFlowParticipant[],
  ): Promise<void> {
    const pendingParticipants = participants.filter((p) => p.status === SignatureFlowParticipantStatus.PENDING);
    const participantsToNotify = this.pickParticipantsToNotify(orderType, pendingParticipants);

    for (const participant of participantsToNotify) {
      if (!participant.userId) continue;

      const title = 'Documento pendiente de firma';
      const message = `Tienes un documento pendiente de firmar: ${documentName}`;

      await this.inAppNotificationRepository.save(new InAppNotification({
        userId: participant.userId,
        title,
        message,
        entityType: 'document',
        entityId: documentId,
      }));

      const user = await this.userRepository.findById(participant.userId);
      if (!user?.email) continue;

      const actionUrl = buildFrontendUrl(`/signature-flows?documentId=${encodeURIComponent(documentId)}`);
      const html = buildPrimactaNotificationEmail({
        title,
        recipientName: user.firstName,
        message,
        actionLabel: 'Ir a pendientes',
        actionUrl,
      });

      await this.emailService.send({
        to: user.email.toString(),
        subject: title,
        text: actionUrl ? `${message}\n\nIr a pendientes: ${actionUrl}` : message,
        html,
      });
    }
  }

  private pickParticipantsToNotify(
    orderType: SignatureFlowOrderType,
    participants: SignatureFlowParticipant[],
  ): SignatureFlowParticipant[] {
    if (orderType !== SignatureFlowOrderType.SEQUENTIAL) {
      return participants;
    }

    const orderedParticipants = participants.filter((participant) => participant.order !== null);
    if (orderedParticipants.length === 0) {
      return participants;
    }

    const firstOrder = Math.min(...orderedParticipants.map((participant) => participant.order as number));
    const firstBatch = participants.filter((participant) => participant.order === firstOrder);

    return firstBatch.length > 0 ? firstBatch : participants;
  }

  private async notifyResponsibleOnRejection(
    documentId: string,
    documentName: string,
    responsibleUserId: string | null,
    rejectionReason: string,
  ): Promise<void> {
    if (!responsibleUserId) return;

    const title = 'Documento rechazado';
    const message = `El documento ${documentName} fue rechazado. Motivo: ${rejectionReason}`;

    await this.inAppNotificationRepository.save(new InAppNotification({
      userId: responsibleUserId,
      title,
      message,
      entityType: 'document',
      entityId: documentId,
    }));

    const responsibleUser = await this.userRepository.findById(responsibleUserId);
    if (!responsibleUser?.email) return;

    const actionUrl = buildFrontendUrl(`/documents/${documentId}/history`);
    const html = buildPrimactaNotificationEmail({
      title,
      recipientName: responsibleUser.firstName,
      message,
      actionLabel: 'Ver historial del documento',
      actionUrl,
    });

    await this.emailService.send({
      to: responsibleUser.email.toString(),
      subject: title,
      text: actionUrl ? `${message}\n\nVer historial: ${actionUrl}` : message,
      html,
    });
  }
}
