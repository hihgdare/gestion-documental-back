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
import { UserRepository } from '@domains/user/repositories/user.repository';
import { ColaboratorRepository } from '@domains/colaborators/repositories/colaborator.repository';
import { SignatureRepository } from '@domains/signature/repositories/signature.repository';
import { TypeOrmFileRepository } from '@shared/infrastructure/repositories/typeorm-file.repository';
import {
  SignaturePdfStampService,
  SignerStampData,
  ValidatorStampData,
} from '@shared/infrastructure/pdf/signature-pdf-stamp.service';
import { Document } from '@domains/document/entities/document.entity';
import { SignatureFlow } from '../entities/signature-flow.entity';
import { ExternalParticipantTokenRepository } from '../repositories/external-participant-token.repository';
import { ExternalParticipantToken } from '../entities/external-participant-token.entity';
import { generateExternalToken, buildExternalTokenExpiry } from './external-participant-access.use-case';
import { buildFrontendUrl } from '@shared/infrastructure/email/templates/primacta-notification-email.template';

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
    private readonly userRepository?: UserRepository,
    private readonly colaboratorRepository?: ColaboratorRepository,
    private readonly signatureRepository?: SignatureRepository,
    private readonly fileRepository?: TypeOrmFileRepository,
    private readonly pdfStampService?: SignaturePdfStampService,
    private readonly externalTokenRepository?: ExternalParticipantTokenRepository,
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

  // Returns true if the signer was found in an active flow and marked as signed.
  // The caller can use this to skip per-signer PDF stamping when a flow is involved.
  async markSignerSignedFromOtp(documentId: string, userId: string, signedAt: Date): Promise<boolean> {
    const flow = await this.flowRepository.findActiveByDocumentId(documentId);
    if (!flow || flow.status !== SignatureFlowStatus.IN_SIGNING) return false;

    const participants = await this.participantRepository.findByFlowId(flow.id);
    const participant = participants.find((p) => (
      p.role === SignatureFlowParticipantRole.SIGNER
      && p.userId === userId
      && p.status === SignatureFlowParticipantStatus.PENDING
      && this.isParticipantEnabledInCurrentStep(flow.orderType, p, participants)
    ));

    if (!participant) return false;

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
    return true;
  }

  // Used by external (no-account) validators — bypasses userId ownership check.
  async executeForExternal(input: { participantId: string; action: 'approve' | 'reject'; comment?: string }): Promise<void> {
    const participant = await this.participantRepository.findById(input.participantId);
    if (!participant) throw new NotFoundError('Participante del flujo no encontrado');

    const flow = await this.flowRepository.findById(participant.flowId);
    if (!flow) throw new NotFoundError('Flujo de firma no encontrado');

    const document = await this.documentRepository.findById(flow.documentId);
    if (!document) throw new NotFoundError('Documento no encontrado');

    if (participant.status !== SignatureFlowParticipantStatus.PENDING) {
      throw new ValidationError('El participante no está pendiente de acción');
    }

    if (participant.role !== SignatureFlowParticipantRole.VALIDATOR) {
      throw new ValidationError('Solo los validadores pueden usar esta acción');
    }

    if (flow.status !== SignatureFlowStatus.IN_REVIEW) {
      throw new ValidationError('El flujo no está en etapa de revisión');
    }

    participant.status = input.action === 'approve'
      ? SignatureFlowParticipantStatus.APPROVED
      : SignatureFlowParticipantStatus.REJECTED;

    if (input.action === 'reject') {
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
      updatedBy: participant.externalEmail ?? participant.id,
      comment: input.comment?.trim() || null,
      flowParticipantId: participant.id,
      actionComment: input.comment?.trim() || null,
    });

    await this.reconcileFlow(flow.id);
  }

  // Used when an external signer completes signing via OTP.
  // signatureTokenHash and ipAddress are already stored in ExternalParticipantToken by the caller.
  async markExternalSignerSignedFromToken(participantId: string, signedAt: Date): Promise<void> {
    const participant = await this.participantRepository.findById(participantId);
    if (!participant) return;

    const flow = await this.flowRepository.findById(participant.flowId);
    if (!flow || flow.status !== SignatureFlowStatus.IN_SIGNING) return;

    if (participant.status !== SignatureFlowParticipantStatus.PENDING) return;

    participant.status = SignatureFlowParticipantStatus.SIGNED;
    participant.actionAt = signedAt;
    await this.participantRepository.update(participant);

    const document = await this.documentRepository.findById(flow.documentId);
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
        updatedBy: participant.userId ?? undefined,
        comment: 'Firmante externo completó la firma con código de verificación',
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

      flow.status = SignatureFlowStatus.REJECTED;
      document.status = DocumentStatus.REJECTED_FOR_SIGN;
      document.comment = rejectionReason;

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
        updatedBy: flow.sentBy || undefined,
        comment: `El flujo fue rechazado por un participante. Motivo: ${rejectionReason}`,
      });

      try {
        await this.notificationService.notifyResponsibleOnRejection(
          document.id,
          document.name,
          document.createdBy,
          rejectionReason,
        );
      } catch (err) {
        console.warn('[reconcileFlow] notifyResponsibleOnRejection failed (non-critical):', err);
      }
      return;
    }

    const validatorsCompleted = validators.length === 0
      || validators.every((p) => p.status === SignatureFlowParticipantStatus.APPROVED);

    // Sequential flow: notify the next pending validator after one approves
    if (
      flow.status === SignatureFlowStatus.IN_REVIEW
      && !validatorsCompleted
      && flow.orderType === SignatureFlowOrderType.SEQUENTIAL
    ) {
      const pendingValidators = validators.filter((p) => p.status === SignatureFlowParticipantStatus.PENDING);
      const nextValidator = pendingValidators
        .filter((p) => p.order !== null)
        .sort((a, b) => (a.order as number) - (b.order as number))[0]
        ?? pendingValidators[0];

      if (nextValidator) {
        try {
          await this.notificationService.notifyParticipantsForCurrentStep(
            [nextValidator],
            document.id,
            document.name,
            flow.orderType,
          );
        } catch (err) {
          console.warn('[reconcileFlow] notify next sequential validator failed (non-critical):', err);
        }

        if (nextValidator.isExternal && nextValidator.externalEmail) {
          try {
            await this.notifyExternalParticipants([nextValidator], document.name);
          } catch (err) {
            console.warn('[reconcileFlow] notifyExternalParticipants for next validator failed (non-critical):', err);
          }
        }
      }
      return;
    }

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
        updatedBy: flow.sentBy || undefined,
        comment: 'Validación completada. Documento enviado a etapa de firma',
      });

      const pendingSigners = signers.filter((p) => p.status === SignatureFlowParticipantStatus.PENDING);
      try {
        await this.notificationService.notifyParticipantsForCurrentStep(pendingSigners, document.id, document.name, flow.orderType);
      } catch (err) {
        console.warn('[reconcileFlow] notifyParticipantsForCurrentStep failed (non-critical):', err);
      }

      const externalSigners = pendingSigners.filter((p) => p.isExternal && p.externalEmail);
      try {
        await this.notifyExternalParticipants(externalSigners, document.name);
      } catch (err) {
        console.warn('[reconcileFlow] notifyExternalParticipants failed (non-critical):', err);
      }
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
        updatedBy: flow.sentBy || undefined,
        comment: 'Todos los firmantes completaron la firma',
      });

      await this.tryStampConsolidatedPdf(flow, document, participants);

      try {
        await this.notificationService.notifyResponsibleOnCompletion(
          document.id,
          document.name,
          document.createdBy,
        );
      } catch (err) {
        console.warn('[reconcileFlow] notifyResponsibleOnCompletion failed (non-critical):', err);
      }
    }
  }

  private async tryStampConsolidatedPdf(
    _flow: SignatureFlow,
    document: Document,
    participants: SignatureFlowParticipant[],
  ): Promise<void> {
    if (!this.pdfStampService || !this.userRepository || !this.signatureRepository || !document.documentUrl) return;

    try {
      const pdfPath = await this.resolvePdfPath(document.documentUrl);
      if (!pdfPath) return;

      const approvedValidators = participants.filter(
        (p) => p.role === SignatureFlowParticipantRole.VALIDATOR
          && p.status === SignatureFlowParticipantStatus.APPROVED,
      );
      const signedSigners = participants.filter(
        (p) => p.role === SignatureFlowParticipantRole.SIGNER
          && p.status === SignatureFlowParticipantStatus.SIGNED,
      );

      const validatorData: ValidatorStampData[] = [];
      for (const v of approvedValidators) {
        const name = v.userId
          ? await this.resolveUserName(v.userId)
          : (v.externalName ?? 'Validador externo');
        validatorData.push({ validatorName: name, actionAt: v.actionAt ?? new Date() });
      }

      const documentSignatures = await this.signatureRepository.findByDocumentId(document.id);
      const signerData: SignerStampData[] = [];
      for (const s of signedSigners) {
        if (s.userId) {
          // Internal signer — look up Signature record for tokenHash/IP
          const user = await this.userRepository.findById(s.userId);
          if (!user) continue;

          const signature = documentSignatures.find(
            (sig) => sig.userId === s.userId && sig.tokenHash,
          );
          if (!signature?.tokenHash) continue;

          const colaborator = this.colaboratorRepository
            ? await this.colaboratorRepository.findByUserId(s.userId)
            : null;

          signerData.push({
            signerName: `${user.firstName} ${user.lastName}`,
            signerDocumentNumber: colaborator?.numeroDocumento ?? 'N/A',
            signerEmail: String(user.email),
            signedAt: signature.signedAt ?? s.actionAt ?? new Date(),
            ipAddress: signature.ipAddress ?? 'N/A',
            tokenHash: signature.tokenHash,
          });
        } else if (s.externalEmail) {
          // External signer — look up ExternalParticipantToken for tokenHash/IP
          const extToken = this.externalTokenRepository
            ? await this.externalTokenRepository.findByParticipantId(s.id)
            : null;

          signerData.push({
            signerName: s.externalName ?? 'Firmante externo',
            signerDocumentNumber: extToken?.documentNumber ?? 'N/A',
            signerEmail: s.externalEmail,
            signedAt: s.actionAt ?? new Date(),
            ipAddress: extToken?.ipAddress ?? 'N/A',
            tokenHash: extToken?.signatureTokenHash ?? 'N/A',
          });
        }
      }

      if (signerData.length === 0) return;

      const verifyUrl = buildFrontendUrl(`/verificar?id=${document.id}`) ?? `/verificar?id=${document.id}`;

      await this.pdfStampService.stampConsolidatedPdf(pdfPath, {
        documentId: document.id,
        completedAt: new Date(),
        verifyUrl,
        validators: validatorData,
        signers: signerData,
      });
    } catch (err) {
      console.warn('[ProcessFlowParticipantActionUseCase] Consolidated PDF stamping failed (non-critical):', err);
    }
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

  private async resolveUserName(userId: string): Promise<string> {
    if (!this.userRepository) return userId;
    const user = await this.userRepository.findById(userId);
    return user ? `${user.firstName} ${user.lastName}` : userId;
  }

  private async resolvePdfPath(documentUrl: string): Promise<string | null> {
    if (documentUrl.toLowerCase().endsWith('.pdf')) return documentUrl;
    if (!this.fileRepository) return null;

    const file = await this.fileRepository.findById(documentUrl);
    if (!file) return null;

    const isPdf = (file.mimeType ?? '').toLowerCase().includes('pdf')
      || file.originalName.toLowerCase().endsWith('.pdf')
      || file.path.toLowerCase().endsWith('.pdf');

    if (!isPdf || file.storage !== 'local') return null;
    return file.path;
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
