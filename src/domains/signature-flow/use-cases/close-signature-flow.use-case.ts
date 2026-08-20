import { SignatureFlow } from '../entities/signature-flow.entity';
import { SignatureFlowRepository } from '../repositories/signature-flow.repository';
import { SignatureFlowParticipantRepository } from '../repositories/signature-flow-participant.repository';
import { DocumentRepository } from '@domains/document/repositories/document.repository';
import { DocumentHistoryRepository } from '@domains/document/repositories/document-history.repository';
import { ForbiddenError, NotFoundError, ValidationError } from '@shared/domain/errors';
import { SignatureFlowNotificationService, ReminderConfig } from '../services/signature-flow-notification.service';
import {
  SignatureFlowOrderType,
  SignatureFlowParticipantRole,
  SignatureFlowParticipantStatus,
  SignatureFlowStatus,
  SignatureFlowNotificationType,
} from '../value-objects/signature-flow-enums';
import { SignatureStatus } from '@domains/signature/value-objects/signature-enums';
import { Document } from '@domains/document/entities/document.entity';
import { DocumentAction, DocumentStatus } from '@domains/document/value-objects/document-enums';
import { getCurrentlyEnabledParticipants } from '../services/signature-flow-step.util';
import { ProcessFlowParticipantActionUseCase } from './progress-signature-flow.use-case';

interface AuthorizedActionInput {
  flowId: string;
  /** null = acción automática del sistema (siempre autorizada, sin dueño). */
  actorUserId: string | null;
  actorCanCloseAny?: boolean;
  comment: string;
}

function historyActorFields(actorUserId: string | null): { updatedBy?: string; updatedByName?: string } {
  return actorUserId ? { updatedBy: actorUserId } : { updatedByName: 'Sistema' };
}

/** Restaura el status del documento como ya se hace al rechazar: si venía aprobado antes del flujo, recupera ese estado. */
function restoreDocumentStatusOnIncompleteFlow(document: Document): DocumentStatus {
  if (document.preFlowStatus === DocumentStatus.APPROVED) {
    return DocumentStatus.APPROVED;
  }
  return DocumentStatus.SIGNATURE_CLOSED;
}

async function assertCanClose(
  flowRepository: SignatureFlowRepository,
  input: AuthorizedActionInput,
): Promise<SignatureFlow> {
  const flow = await flowRepository.findById(input.flowId);
  if (!flow) throw new NotFoundError('Flujo de firma no encontrado');

  if (input.actorUserId !== null && flow.sentBy !== input.actorUserId && !input.actorCanCloseAny) {
    throw new ForbiddenError('Solo quien envió el documento a firmar o un administrador puede realizar esta acción');
  }

  if (flow.status !== SignatureFlowStatus.IN_SIGNING) {
    throw new ValidationError('El flujo no está en etapa de firma');
  }

  if (!input.comment || !input.comment.trim()) {
    throw new ValidationError('Debes indicar un motivo');
  }

  return flow;
}

/** Salta al firmante actual (en flujo secuencial) para liberar el turno al siguiente pendiente. */
export class SkipSignerUseCase {
  constructor(
    private readonly flowRepository: SignatureFlowRepository,
    private readonly participantRepository: SignatureFlowParticipantRepository,
    private readonly documentRepository: DocumentRepository,
    private readonly documentHistoryRepository: DocumentHistoryRepository,
    private readonly notificationService: SignatureFlowNotificationService,
    private readonly processFlowParticipantActionUseCase: ProcessFlowParticipantActionUseCase,
  ) {}

  async execute(input: AuthorizedActionInput): Promise<void> {
    const flow = await assertCanClose(this.flowRepository, input);

    if (flow.signerOrderType !== SignatureFlowOrderType.SEQUENTIAL) {
      throw new ValidationError('Saltar firmante solo aplica a flujos de firma secuenciales');
    }

    const document = await this.documentRepository.findById(flow.documentId);
    if (!document) throw new NotFoundError('Documento no encontrado');

    const allParticipants = await this.participantRepository.findByFlowId(flow.id);
    const currentSigners = getCurrentlyEnabledParticipants(flow, allParticipants)
      .filter((p) => p.role === SignatureFlowParticipantRole.SIGNER);

    if (currentSigners.length === 0) {
      throw new ValidationError('No hay ningún firmante activo para saltar');
    }

    const currentIds = new Set(currentSigners.map((p) => p.id));
    const remainingPending = allParticipants.filter(
      (p) => p.role === SignatureFlowParticipantRole.SIGNER
        && p.status === SignatureFlowParticipantStatus.PENDING
        && !currentIds.has(p.id),
    );

    if (remainingPending.length === 0) {
      throw new ValidationError('No quedan más firmantes a los que saltar. Usa "Cerrar proceso de firma" en su lugar.');
    }

    const comment = input.comment.trim();
    for (const participant of currentSigners) {
      participant.status = SignatureFlowParticipantStatus.SKIPPED;
      participant.actionAt = new Date();
      participant.rejectionComment = comment;
      await this.participantRepository.update(participant);

      await this.notificationService.cancelReminder(participant.id);

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
        action: DocumentAction.FLOW_PARTICIPANT_SKIPPED,
        ...historyActorFields(input.actorUserId),
        comment,
        flowParticipantId: participant.id,
        actionComment: comment,
      });

      try {
        await this.notificationService.notifyParticipantSkipped(participant, document.id, document.name, comment, false);
      } catch (err) {
        console.warn('[SkipSignerUseCase] notifyParticipantSkipped failed (non-critical):', err);
      }
    }

    await this.processFlowParticipantActionUseCase.reconcileFlow(flow.id);
  }
}

/** Cierra el proceso de firma sin que se complete: los firmantes que seguían pendientes quedan marcados como saltados. */
export class CloseSignatureFlowUseCase {
  constructor(
    private readonly flowRepository: SignatureFlowRepository,
    private readonly participantRepository: SignatureFlowParticipantRepository,
    private readonly documentRepository: DocumentRepository,
    private readonly documentHistoryRepository: DocumentHistoryRepository,
    private readonly notificationService: SignatureFlowNotificationService,
  ) {}

  async execute(input: AuthorizedActionInput): Promise<void> {
    const flow = await assertCanClose(this.flowRepository, input);

    const document = await this.documentRepository.findById(flow.documentId);
    if (!document) throw new NotFoundError('Documento no encontrado');

    const allParticipants = await this.participantRepository.findByFlowId(flow.id);
    const pendingSigners = allParticipants.filter(
      (p) => p.role === SignatureFlowParticipantRole.SIGNER && p.status === SignatureFlowParticipantStatus.PENDING,
    );

    if (pendingSigners.length === 0) {
      throw new ValidationError('No hay firmantes pendientes para cerrar');
    }

    const comment = input.comment.trim();
    for (const participant of pendingSigners) {
      participant.status = SignatureFlowParticipantStatus.SKIPPED;
      participant.actionAt = new Date();
      participant.rejectionComment = comment;
      await this.participantRepository.update(participant);
      await this.notificationService.cancelReminder(participant.id);

      try {
        await this.notificationService.notifyParticipantSkipped(participant, document.id, document.name, comment, true);
      } catch (err) {
        console.warn('[CloseSignatureFlowUseCase] notifyParticipantSkipped failed (non-critical):', err);
      }
    }

    flow.status = SignatureFlowStatus.CLOSED;
    document.status = restoreDocumentStatusOnIncompleteFlow(document);
    if (document.preFlowStatus === DocumentStatus.APPROVED) document.preFlowStatus = null;
    document.signatureStatus = SignatureStatus.CLOSED;
    document.comment = comment;

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
      action: DocumentAction.FLOW_CLOSED,
      ...historyActorFields(input.actorUserId),
      comment,
    });

    try {
      await this.notificationService.notifyResponsibleOnClose(document.id, document.name, document.createdBy, comment);
    } catch (err) {
      console.warn('[CloseSignatureFlowUseCase] notifyResponsibleOnClose failed (non-critical):', err);
    }
  }
}

export interface ReopenSignatureFlowInput {
  flowId: string;
  actorUserId: string;
  actorCanReopen: boolean;
  comment: string;
}

/**
 * Reabre un flujo cerrado para continuar con los firmantes que quedaron saltados por el cierre.
 * A diferencia de saltar/cerrar, no admite al responsable del envío — solo administradores.
 */
export class ReopenSignatureFlowUseCase {
  constructor(
    private readonly flowRepository: SignatureFlowRepository,
    private readonly participantRepository: SignatureFlowParticipantRepository,
    private readonly documentRepository: DocumentRepository,
    private readonly documentHistoryRepository: DocumentHistoryRepository,
    private readonly notificationService: SignatureFlowNotificationService,
  ) {}

  async execute(input: ReopenSignatureFlowInput): Promise<void> {
    if (!input.actorCanReopen) {
      throw new ForbiddenError('Solo un administrador puede reabrir un proceso de firma cerrado');
    }
    if (!input.comment || !input.comment.trim()) {
      throw new ValidationError('Debes indicar un motivo');
    }

    const flow = await this.flowRepository.findById(input.flowId);
    if (!flow) throw new NotFoundError('Flujo de firma no encontrado');
    if (flow.status !== SignatureFlowStatus.CLOSED) {
      throw new ValidationError('El flujo no está cerrado');
    }

    const document = await this.documentRepository.findById(flow.documentId);
    if (!document) throw new NotFoundError('Documento no encontrado');

    const comment = input.comment.trim();
    const allParticipants = await this.participantRepository.findByFlowId(flow.id);
    const skippedSigners = allParticipants.filter(
      (p) => p.role === SignatureFlowParticipantRole.SIGNER && p.status === SignatureFlowParticipantStatus.SKIPPED,
    );

    if (skippedSigners.length === 0) {
      throw new ValidationError('No hay firmantes para reactivar en este flujo');
    }

    for (const participant of skippedSigners) {
      participant.status = SignatureFlowParticipantStatus.PENDING;
      participant.actionAt = null;
      participant.rejectionComment = null;
      await this.participantRepository.update(participant);
    }

    flow.status = SignatureFlowStatus.IN_SIGNING;
    // El plazo de cierre automático se cuenta desde el envío original (sentAt), que no cambia
    // al reabrir — lo desactivamos para que no se vuelva a cerrar de inmediato en el próximo ciclo.
    flow.autoCloseEnabled = false;
    await this.flowRepository.update(flow);

    if (
      document.status === DocumentStatus.DRAFT
      || document.status === DocumentStatus.UPLOADED
      || document.status === DocumentStatus.APPROVED
    ) {
      document.preFlowStatus = document.status;
    }
    document.status = DocumentStatus.IN_SIGNING;
    document.signatureStatus = SignatureStatus.PENDING;
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
      action: DocumentAction.FLOW_REOPENED,
      updatedBy: input.actorUserId,
      comment,
    });

    const reminderConfig: ReminderConfig = { enabled: flow.reminderEnabled, intervalMinutes: flow.reminderIntervalMinutes };
    const pendingSigners = (await this.participantRepository.findByFlowId(flow.id))
      .filter((p) => p.role === SignatureFlowParticipantRole.SIGNER && p.status === SignatureFlowParticipantStatus.PENDING);

    try {
      await this.notificationService.notifyParticipantsForCurrentStep(
        pendingSigners,
        document.id,
        document.name,
        flow.signerOrderType,
        SignatureFlowNotificationType.INITIAL,
        null,
        reminderConfig,
      );
    } catch (err) {
      console.warn('[ReopenSignatureFlowUseCase] notifyParticipantsForCurrentStep failed (non-critical):', err);
    }

    const currentParticipants = this.notificationService.pickParticipantsToNotify(flow.signerOrderType, pendingSigners);
    const externalCurrent = currentParticipants.filter((p) => p.isExternal && p.externalEmail);
    for (const participant of externalCurrent) {
      try {
        await this.notificationService.refreshTokenAndNotifyExternalParticipant(
          participant,
          document.name,
          SignatureFlowNotificationType.INITIAL,
          null,
          reminderConfig,
        );
      } catch (err) {
        console.warn('[ReopenSignatureFlowUseCase] refreshTokenAndNotifyExternalParticipant failed (non-critical):', err);
      }
    }

    try {
      await this.notificationService.notifyResponsibleOnReopen(document.id, document.name, document.createdBy, comment);
    } catch (err) {
      console.warn('[ReopenSignatureFlowUseCase] notifyResponsibleOnReopen failed (non-critical):', err);
    }
  }
}
