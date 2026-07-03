import { SignatureFlowParticipant } from '../entities/signature-flow-participant.entity';
import {
  SignatureFlowOrderType,
  SignatureFlowParticipantRole,
} from '../value-objects/signature-flow-enums';
import { UserRepository } from '@domains/user/repositories/user.repository';
import { InAppNotificationRepository } from '@domains/notification/repositories/in-app-notification.repository';
import { InAppNotification } from '@domains/notification/entities/in-app-notification.entity';
import { EmailService, EmailOptions } from '@shared/infrastructure/email/email-service.interface';
import { EmailQueueService } from '@shared/infrastructure/email/email-queue.service';
import {
  buildFrontendUrl,
  buildPrimactaNotificationEmail,
} from '@shared/infrastructure/email/templates/primacta-notification-email.template';

export class SignatureFlowNotificationService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly inAppNotificationRepository: InAppNotificationRepository,
    private readonly emailService: EmailService,
    private readonly emailQueueService?: EmailQueueService,
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

  /**
   * Notifica participantes internos durante el progreso del flujo.
   * Envía in-app + email (directo o encolado según configuración).
   */
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

      const options: EmailOptions = {
        to: user.email.toString(),
        subject: title,
        text: actionUrl ? `${message}\n\nIr a pendientes: ${actionUrl}` : message,
        html,
      };

      await this.sendOrEnqueue(options);
    }
  }

  /**
   * Crea notificaciones in-app para participantes internos y retorna los datos de email
   * sin enviarlos. Usado por create-signature-flow para encolar el batch inicial.
   */
  async collectEmailsForParticipants(
    participants: SignatureFlowParticipant[],
    documentId: string,
    documentName: string,
    orderType: SignatureFlowOrderType,
  ): Promise<EmailOptions[]> {
    const toNotify = this.pickParticipantsToNotify(orderType, participants);
    const emails: EmailOptions[] = [];

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

      emails.push({
        to: user.email.toString(),
        subject: title,
        text: actionUrl ? `${message}\n\nIr a pendientes: ${actionUrl}` : message,
        html,
      });
    }

    return emails;
  }

  /**
   * Construye los datos de email para un participante externo sin enviarlos.
   * Usado por create-signature-flow para encolar el batch inicial.
   */
  buildExternalParticipantEmailOptions(
    externalEmail: string,
    externalName: string | null,
    role: string,
    documentName: string,
    accessUrl: string,
  ): EmailOptions {
    const isValidator = role === 'validator';
    const title = isValidator ? 'Documento pendiente de revisión' : 'Documento pendiente de firma';
    const action = isValidator ? 'revisar y aprobar' : 'firmar';
    const actionLabel = isValidator ? 'Ir a revisar' : 'Ir a firmar';
    const message = `Has sido invitado a ${action} el documento: ${documentName}. El enlace es válido por tiempo limitado.`;

    const html = buildPrimactaNotificationEmail({
      title,
      recipientName: externalName ?? 'Participante',
      message,
      actionLabel,
      actionUrl: accessUrl,
    });

    return {
      to: externalEmail,
      subject: title,
      text: `${message}\n\n${actionLabel}: ${accessUrl}`,
      html,
    };
  }

  async notifyResponsibleOnCompletion(
    documentId: string,
    documentName: string,
    responsibleUserId: string | null,
  ): Promise<void> {
    if (!responsibleUserId) return;

    const title = 'Documento firmado';
    const message = `El documento ${documentName} completó el proceso de firma exitosamente.`;

    await this.inAppNotificationRepository.save(new InAppNotification({
      userId: responsibleUserId,
      title,
      message,
      entityType: 'document',
      entityId: documentId,
    }));

    const responsibleUser = await this.userRepository.findById(responsibleUserId);
    if (!responsibleUser?.email) return;

    const actionUrl = buildFrontendUrl(`/documents`);
    const html = buildPrimactaNotificationEmail({
      title,
      recipientName: responsibleUser.firstName,
      message,
      actionLabel: 'Ver documentos',
      actionUrl,
    });

    await this.sendOrEnqueue({
      to: responsibleUser.email.toString(),
      subject: title,
      text: actionUrl ? `${message}\n\nVer documentos: ${actionUrl}` : message,
      html,
    });
  }

  async notifyExternalParticipant(
    externalEmail: string,
    externalName: string | null,
    role: string,
    documentName: string,
    accessUrl: string,
  ): Promise<void> {
    const options = this.buildExternalParticipantEmailOptions(externalEmail, externalName, role, documentName, accessUrl);
    await this.sendOrEnqueue(options);
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

    await this.sendOrEnqueue({
      to: responsibleUser.email.toString(),
      subject: title,
      text: actionUrl ? `${message}\n\nVer historial: ${actionUrl}` : message,
      html,
    });
  }

  private async sendOrEnqueue(options: EmailOptions): Promise<void> {
    if (this.emailQueueService) {
      await this.emailQueueService.enqueue({
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });
    } else {
      await this.emailService.send(options);
    }
  }
}
