import { SignatureFlowParticipant } from '../entities/signature-flow-participant.entity';
import {
  SignatureFlowOrderType,
  SignatureFlowParticipantRole,
} from '../value-objects/signature-flow-enums';
import { UserRepository } from '@domains/user/repositories/user.repository';
import { InAppNotificationRepository } from '@domains/notification/repositories/in-app-notification.repository';
import { InAppNotification } from '@domains/notification/entities/in-app-notification.entity';
import { EmailService } from '@shared/infrastructure/email/email-service.interface';
import {
  buildFrontendUrl,
  buildPrimactaNotificationEmail,
} from '@shared/infrastructure/email/templates/primacta-notification-email.template';

export class SignatureFlowNotificationService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly inAppNotificationRepository: InAppNotificationRepository,
    private readonly emailService: EmailService,
  ) {}

  pickParticipantsToNotify(
    orderType: SignatureFlowOrderType,
    participants: SignatureFlowParticipant[],
  ): SignatureFlowParticipant[] {
    if (orderType !== SignatureFlowOrderType.SEQUENTIAL) return participants;

    const ordered = participants.filter((p) => p.order !== null);
    if (ordered.length === 0) return participants;

    const firstOrder = Math.min(...ordered.map((p) => p.order as number));
    const firstBatch = participants.filter((p) => p.order === firstOrder);
    return firstBatch.length > 0 ? firstBatch : participants;
  }

  async notifyParticipantsForCurrentStep(
    participants: SignatureFlowParticipant[],
    documentId: string,
    documentName: string,
    orderType: SignatureFlowOrderType,
  ): Promise<void> {
    const toNotify = this.pickParticipantsToNotify(orderType, participants);

    for (const participant of toNotify) {
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

  async notifyResponsibleOnRejection(
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
