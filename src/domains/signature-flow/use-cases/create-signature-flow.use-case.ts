import { SignatureFlow, SignatureFlowProps } from '../entities/signature-flow.entity';
import { SignatureFlowParticipant, SignatureFlowParticipantProps } from '../entities/signature-flow-participant.entity';
import { type SignatureFlowRepository } from '../repositories/signature-flow.repository';
import { type SignatureFlowParticipantRepository } from '../repositories/signature-flow-participant.repository';
import { DocumentRepository } from '@domains/document/repositories/document.repository';
import { DocumentHistoryRepository } from '@domains/document/repositories/document-history.repository';
import { DocumentAction, DocumentStatus } from '@domains/document/value-objects/document-enums';
import {
  SignatureFlowParticipantRole,
  SignatureFlowStatus,
} from '../value-objects/signature-flow-enums';
import { SignatureFlowNotificationService } from '../services/signature-flow-notification.service';
import { NotFoundError, ValidationError } from '@shared/domain/errors';
import { ExternalParticipantTokenRepository } from '../repositories/external-participant-token.repository';
import { ExternalParticipantToken } from '../entities/external-participant-token.entity';
import { generateExternalToken, buildExternalTokenExpiry } from './external-participant-access.use-case';
import { buildFrontendUrl } from '@shared/infrastructure/email/templates/primacta-notification-email.template';

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
    private readonly notificationService: SignatureFlowNotificationService,
    private readonly externalTokenRepository?: ExternalParticipantTokenRepository,
  ) {}

  async execute(input: CreateSignatureFlowInput): Promise<SignatureFlow> {
    if (!input.participants || input.participants.length === 0) {
      throw new ValidationError('El flujo debe tener al menos un participante');
    }

    for (const p of input.participants) {
      if (!p.userId && !p.externalEmail) {
        throw new ValidationError('Cada participante debe tener un usuario asignado o un correo externo');
      }
    }

    const document = await this.documentRepository.findById(input.documentId);
    if (!document) {
      throw new NotFoundError('Documento no encontrado');
    }

    const now = new Date();
    const hasValidators = input.participants.some((p) => p.role === SignatureFlowParticipantRole.VALIDATOR);

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
      const saved = await this.participantRepository.save(SignatureFlowParticipant.create(participantProps));
      savedParticipants.push(saved);
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

    const validators = savedParticipants.filter((p) => p.role === SignatureFlowParticipantRole.VALIDATOR);
    const signers = savedParticipants.filter((p) => p.role === SignatureFlowParticipantRole.SIGNER);
    const toNotify = validators.length > 0 ? validators : signers;
    await this.notificationService.notifyParticipantsForCurrentStep(toNotify, document.id, document.name, flow.orderType);

    // Generate access tokens and send emails for external participants in the first active step
    const firstStepExternal = toNotify.filter((p) => p.isExternal && p.externalEmail);
    await this.notifyExternalParticipants(firstStepExternal, document.name);

    return flow;
  }

  private async notifyExternalParticipants(
    participants: SignatureFlowParticipant[],
    documentName: string,
  ): Promise<void> {
    if (!this.externalTokenRepository) return;
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
      await this.notificationService.notifyExternalParticipant(
        email,
        p.externalName,
        p.role,
        documentName,
        accessUrl,
      );
    }
  }
}
