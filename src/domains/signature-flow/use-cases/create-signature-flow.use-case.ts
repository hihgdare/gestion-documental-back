import { SignatureFlow, SignatureFlowProps } from '../entities/signature-flow.entity';
import { SignatureFlowParticipant, SignatureFlowParticipantProps } from '../entities/signature-flow-participant.entity';
import { type SignatureFlowRepository } from '../repositories/signature-flow.repository';
import { type SignatureFlowParticipantRepository } from '../repositories/signature-flow-participant.repository';
import { Document } from '@domains/document/entities/document.entity';
import { DocumentRepository } from '@domains/document/repositories/document.repository';
import { DocumentHistoryRepository } from '@domains/document/repositories/document-history.repository';
import { DocumentAction, DocumentStatus } from '@domains/document/value-objects/document-enums';
import {
  SignatureFlowParticipantRole,
  SignatureFlowStatus,
  SignatureFlowNotificationType,
} from '../value-objects/signature-flow-enums';
import { SignatureFlowNotificationService, EmailWithParticipant } from '../services/signature-flow-notification.service';
import { NotFoundError, ValidationError } from '@shared/domain/errors';
import { ExternalParticipantTokenRepository } from '../repositories/external-participant-token.repository';
import { ExternalParticipantToken } from '../entities/external-participant-token.entity';
import { generateExternalToken, buildExternalTokenExpiry } from './external-participant-access.use-case';
import { buildFrontendUrl } from '@shared/infrastructure/email/templates/primacta-notification-email.template';
import { EmailQueueService } from '@shared/infrastructure/email/email-queue.service';
import { ColaboratorRepository } from '@domains/colaborators/repositories/colaborator.repository';

const ALLOWED_START_STATUSES = [
  DocumentStatus.DRAFT,
  DocumentStatus.UPLOADED,
  DocumentStatus.APPROVED,
  DocumentStatus.REJECTED_FOR_SIGN,
];

export interface CreateSignatureFlowInput {
  documentId: string;
  orderType?: string;
  signerOrderType?: string;
  sentBy?: string;
  participants: Array<{
    userId?: string;
    colaboratorId?: string;
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
    private readonly notificationService: SignatureFlowNotificationService,
    private readonly colaboratorRepository: ColaboratorRepository,
    private readonly externalTokenRepository?: ExternalParticipantTokenRepository,
    private readonly emailQueueService?: EmailQueueService,
  ) {}

  async execute(input: CreateSignatureFlowInput): Promise<SignatureFlow> {
    if (!input.participants || input.participants.length === 0) {
      throw new ValidationError('El flujo debe tener al menos un participante');
    }

    for (const p of input.participants) {
      if (!p.userId && !p.externalEmail && !p.colaboratorId) {
        throw new ValidationError('Cada participante debe tener un usuario, un colaborador o un correo externo asignado');
      }
    }

    const document = await this.documentRepository.findById(input.documentId);
    if (!document) {
      throw new NotFoundError('Documento no encontrado');
    }

    if (!ALLOWED_START_STATUSES.includes(document.status)) {
      throw new ValidationError('El documento no está en un estado válido para iniciar un flujo de firma');
    }

    // Guarda el status "real" (draft/uploaded/approved) antes de que el flujo lo mueva.
    // En un reenvío desde rejected_for_sign ya está guardado de un ciclo anterior: no se pisa.
    if (
      document.status === DocumentStatus.DRAFT
      || document.status === DocumentStatus.UPLOADED
      || document.status === DocumentStatus.APPROVED
    ) {
      document.preFlowStatus = document.status;
    }

    const resolvedParticipants = await this.resolveColaboratorParticipants(input.participants);

    const now = new Date();
    const hasValidators = resolvedParticipants.some((p) => p.role === SignatureFlowParticipantRole.VALIDATOR);

    const flowProps: SignatureFlowProps = {
      documentId: input.documentId,
      orderType: input.orderType,
      signerOrderType: input.signerOrderType,
      status: hasValidators ? SignatureFlowStatus.IN_REVIEW : SignatureFlowStatus.IN_SIGNING,
      sentAt: now,
      sentBy: input.sentBy ?? null,
    };

    const flow = await this.signatureFlowRepository.save(SignatureFlow.create(flowProps));

    const savedParticipants: SignatureFlowParticipant[] = [];

    for (const p of resolvedParticipants) {
      const participantProps: SignatureFlowParticipantProps = {
        flowId: flow.id,
        userId: p.userId ?? null,
        colaboratorId: p.colaboratorId ?? null,
        externalName: p.externalName ?? null,
        externalEmail: p.externalEmail ?? null,
        role: p.role,
        order: p.order ?? null,
      };
      const saved = await this.participantRepository.save(SignatureFlowParticipant.create(participantProps));
      savedParticipants.push(saved);
    }

    document.signatureFlowId = flow.id;

    if (this.emailQueueService) {
      await this.executeWithQueue(flow, document, savedParticipants, hasValidators, input.sentBy);
    } else {
      await this.executeWithDirectSend(flow, document, savedParticipants, hasValidators, input.sentBy);
    }

    return flow;
  }

  private async executeWithQueue(
    flow: SignatureFlow,
    document: Document & { id: string },
    savedParticipants: SignatureFlowParticipant[],
    hasValidators: boolean,
    sentBy?: string,
  ): Promise<void> {
    document.status = DocumentStatus.PENDING_NOTIFICATION;
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
      updatedBy: sentBy,
      comment: 'Documento enviado al flujo de firma. Notificando participantes...',
    });

    const validators = savedParticipants.filter((p) => p.role === SignatureFlowParticipantRole.VALIDATOR);
    const signers = savedParticipants.filter((p) => p.role === SignatureFlowParticipantRole.SIGNER);
    const toNotify = validators.length > 0 ? validators : signers;
    const notifyOrderType = validators.length > 0 ? flow.orderType : flow.signerOrderType;

    // Collect in-app notifications + email data for internal users
    const internalEmails = await this.notificationService.collectEmailsForParticipants(
      toNotify,
      document.id,
      document.name,
      notifyOrderType,
    );

    // Generate tokens and collect email data for external participants
    const firstStepParticipants = this.notificationService.pickParticipantsToNotify(notifyOrderType, toNotify);
    const firstStepExternal = firstStepParticipants.filter((p) => p.isExternal && p.externalEmail);
    const externalEmails = await this.collectExternalEmails(firstStepExternal, document.name);

    const allEmails = [...internalEmails, ...externalEmails];
    if (allEmails.length > 0) {
      const jobs = await this.emailQueueService!.enqueueMany(
        allEmails.map((email) => ({ ...email.options, correlationId: flow.id })),
      );
      await this.notificationService.logNotifications(allEmails.map((email, index) => ({
        participantId: email.participantId,
        flowId: email.flowId,
        emailJobId: jobs[index]?.id ?? null,
        type: SignatureFlowNotificationType.INITIAL,
        triggeredBy: null,
      })));
    }
  }

  private async executeWithDirectSend(
    flow: SignatureFlow,
    document: Document & { id: string },
    savedParticipants: SignatureFlowParticipant[],
    hasValidators: boolean,
    sentBy?: string,
  ): Promise<void> {
    document.status = hasValidators ? DocumentStatus.IN_REVIEW_FOR_SIGN : DocumentStatus.IN_SIGNING;
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
      updatedBy: sentBy,
      comment: 'Documento enviado al flujo de firma',
    });

    const validators = savedParticipants.filter((p) => p.role === SignatureFlowParticipantRole.VALIDATOR);
    const signers = savedParticipants.filter((p) => p.role === SignatureFlowParticipantRole.SIGNER);
    const toNotify = validators.length > 0 ? validators : signers;
    const notifyOrderType = validators.length > 0 ? flow.orderType : flow.signerOrderType;

    await this.notificationService.notifyParticipantsForCurrentStep(toNotify, document.id, document.name, notifyOrderType);

    const firstStepParticipants = this.notificationService.pickParticipantsToNotify(notifyOrderType, toNotify);
    const firstStepExternal = firstStepParticipants.filter((p) => p.isExternal && p.externalEmail);
    await this.notifyExternalParticipants(firstStepExternal, document.name);
  }

  private async resolveColaboratorParticipants(
    participants: CreateSignatureFlowInput['participants'],
  ): Promise<CreateSignatureFlowInput['participants']> {
    const resolved: CreateSignatureFlowInput['participants'] = [];
    for (const p of participants) {
      if (!p.colaboratorId) {
        resolved.push(p);
        continue;
      }
      const colaborator = await this.colaboratorRepository.findById(p.colaboratorId);
      if (!colaborator) {
        throw new ValidationError('Uno de los colaboradores seleccionados no existe');
      }
      resolved.push({
        ...p,
        externalName: colaborator.getNombreCompleto(),
        externalEmail: colaborator.email,
      });
    }
    return resolved;
  }

  private async collectExternalEmails(
    participants: SignatureFlowParticipant[],
    documentName: string,
  ): Promise<EmailWithParticipant[]> {
    if (!this.externalTokenRepository) return [];
    const emails: EmailWithParticipant[] = [];
    for (const p of participants) {
      const email = p.externalEmail;
      if (!email) continue;
      await this.externalTokenRepository.deleteByParticipantId(p.id);
      const token = ExternalParticipantToken.create({
        participantId: p.id,
        token: generateExternalToken(),
        expiresAt: buildExternalTokenExpiry(),
      });
      const saved = await this.externalTokenRepository.save(token);
      const accessUrl = buildFrontendUrl(`/external-signature/${saved.token}`);
      if (!accessUrl) continue;
      emails.push({
        participantId: p.id,
        flowId: p.flowId,
        options: this.notificationService.buildExternalParticipantEmailOptions(email, p.externalName, p.role, documentName, accessUrl),
      });
    }
    return emails;
  }

  private async notifyExternalParticipants(
    participants: SignatureFlowParticipant[],
    documentName: string,
  ): Promise<void> {
    for (const p of participants) {
      await this.notificationService.refreshTokenAndNotifyExternalParticipant(p, documentName);
    }
  }
}
