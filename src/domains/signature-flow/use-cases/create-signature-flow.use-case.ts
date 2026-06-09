import { SignatureFlow, SignatureFlowProps } from '../entities/signature-flow.entity';
import { SignatureFlowParticipant, SignatureFlowParticipantProps } from '../entities/signature-flow-participant.entity';
import { type SignatureFlowRepository } from '../repositories/signature-flow.repository';
import { type SignatureFlowParticipantRepository } from '../repositories/signature-flow-participant.repository';
import { DocumentRepository } from '@domains/document/repositories/document.repository';
import { DocumentHistoryRepository } from '@domains/document/repositories/document-history.repository';
import { UserRepository } from '@domains/user/repositories/user.repository';
import { InAppNotificationRepository } from '@domains/notification/repositories/in-app-notification.repository';
import { InAppNotification } from '@domains/notification/entities/in-app-notification.entity';
import { DocumentAction, DocumentStatus } from '@domains/document/value-objects/document-enums';
import {
  SignatureFlowOrderType,
  SignatureFlowParticipantRole,
  SignatureFlowStatus,
} from '../value-objects/signature-flow-enums';
import { EmailService } from '@shared/infrastructure/email/email-service.interface';
import {
  buildFrontendUrl,
  buildPrimactaNotificationEmail,
} from '@shared/infrastructure/email/templates/primacta-notification-email.template';
import { NotFoundError, ValidationError } from '@shared/domain/errors';

export interface CreateSignatureFlowInput {
  documentId: string;
  orderType?: string;
  sentBy?: string;
  participants: Array<{
    userId?: string;
    externalName?: string;
    externalEmail?: string;
    role: string;
    order?: number;
  }>;
}

export class CreateSignatureFlowUseCase {
  constructor(
    private readonly signatureFlowRepository: SignatureFlowRepository,
    private readonly participantRepository: SignatureFlowParticipantRepository,
    private readonly documentRepository: DocumentRepository,
    private readonly documentHistoryRepository: DocumentHistoryRepository,
    private readonly userRepository: UserRepository,
    private readonly inAppNotificationRepository: InAppNotificationRepository,
    private readonly emailService: EmailService,
  ) {}

  async execute(input: CreateSignatureFlowInput): Promise<SignatureFlow> {
    if (!input.participants || input.participants.length === 0) {
      throw new ValidationError('El flujo debe tener al menos un participante');
    }

    const document = await this.documentRepository.findById(input.documentId);
    if (!document) {
      throw new NotFoundError('Documento no encontrado');
    }

    const now = new Date();
    const hasValidators = input.participants.some((participant) => participant.role === SignatureFlowParticipantRole.VALIDATOR);

    const flowProps: SignatureFlowProps = {
      documentId: input.documentId,
      orderType: input.orderType,
      status: hasValidators ? SignatureFlowStatus.IN_REVIEW : SignatureFlowStatus.IN_SIGNING,
      sentAt: now,
      sentBy: input.sentBy ?? null,
    };

    const flow = await this.signatureFlowRepository.save(SignatureFlow.create(flowProps));

    const savedParticipants: SignatureFlowParticipant[] = [];

    for (const p of input.participants) {
      const participantProps: SignatureFlowParticipantProps = {
        flowId: flow.id,
        userId: p.userId ?? null,
        externalName: p.externalName ?? null,
        externalEmail: p.externalEmail ?? null,
        role: p.role,
        order: p.order ?? null,
      };
      const savedParticipant = await this.participantRepository.save(SignatureFlowParticipant.create(participantProps));
      savedParticipants.push(savedParticipant);
    }

    document.signatureFlowId = flow.id;
    document.status = hasValidators ? DocumentStatus.IN_REVIEW : DocumentStatus.IN_SIGNING;
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
      action: DocumentAction.FLOW_SENT,
      updatedBy: input.sentBy,
      comment: 'Documento enviado al flujo de firma',
    });

    await this.notifyParticipantsForCurrentStep(document.id, document.name, flow.orderType, savedParticipants);

    return flow;
  }

  private async notifyParticipantsForCurrentStep(
    documentId: string,
    documentName: string,
    orderType: SignatureFlowOrderType,
    participants: SignatureFlowParticipant[],
  ): Promise<void> {
    const validators = participants.filter((participant) => participant.role === SignatureFlowParticipantRole.VALIDATOR);
    const signers = participants.filter((participant) => participant.role === SignatureFlowParticipantRole.SIGNER);
    const participantsToNotify = validators.length > 0
      ? this.pickParticipantsToNotify(orderType, validators)
      : this.pickParticipantsToNotify(orderType, signers);

    for (const participant of participantsToNotify) {
      if (!participant.userId) continue;

      const isValidator = participant.role === SignatureFlowParticipantRole.VALIDATOR;
      const title = isValidator ? 'Documento pendiente de revision' : 'Documento pendiente de firma';
      const message = isValidator
        ? `Tienes un documento pendiente de revisar: ${documentName}`
        : `Tienes un documento pendiente de firmar: ${documentName}`;

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
}
