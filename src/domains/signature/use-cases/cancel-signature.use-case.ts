import { DocumentRepository } from '@domains/document/repositories/document.repository';
import { DocumentHistoryRepository } from '@domains/document/repositories/document-history.repository';
import { DocumentAction } from '@domains/document/value-objects/document-enums';
import { SignatureRepository } from '../repositories/signature.repository';
import { SignatureVerificationCodeRepository } from '../repositories/signature-verification-code.repository';
import { SignatureStatus, SignatureRejectionCode } from '../value-objects/signature-enums';
import { ProcessFlowParticipantActionUseCase } from '@domains/signature-flow/use-cases/progress-signature-flow.use-case';
import { NotFoundError, ValidationError } from '@shared/domain/errors';

export interface CancelSignatureParams {
  signatureId: string;
  userId: string;
}

export class CancelSignatureUseCase {
  constructor(
    private readonly signatureRepository: SignatureRepository,
    private readonly signatureCodeRepository: SignatureVerificationCodeRepository,
    private readonly documentRepository: DocumentRepository,
    private readonly documentHistoryRepository: DocumentHistoryRepository,
    private readonly processFlowParticipantActionUseCase?: ProcessFlowParticipantActionUseCase,
  ) {}

  async execute(params: CancelSignatureParams): Promise<void> {
    const { signatureId, userId } = params;

    const signature = await this.signatureRepository.findById(signatureId);
    if (!signature) {
      throw new NotFoundError('Proceso de firma no encontrado');
    }

    if (signature.status !== SignatureStatus.PENDING) {
      throw new ValidationError('Solo se pueden cancelar procesos de firma en estado pendiente');
    }

    const activeCode = await this.signatureCodeRepository.findActiveBySignatureId(signatureId);

    const effectiveRejectionCode = activeCode?.isExpired
      ? SignatureRejectionCode.CODE_EXPIRED
      : SignatureRejectionCode.CANCELLED;
    const rejectionReason = effectiveRejectionCode === SignatureRejectionCode.CODE_EXPIRED
      ? 'Firma rechazada por tiempo agotado'
      : 'Firma cancelada por el usuario';

    signature.status = SignatureStatus.REJECTED;
    signature.rejectionCode = effectiveRejectionCode;
    signature.rejectionReason = rejectionReason;
    signature.updatedAt = new Date();
    await this.signatureRepository.update(signature);

    const document = await this.documentRepository.findById(signature.documentId);
    if (document) {
      document.updateSignatureStatus(SignatureStatus.REJECTED);
      await this.documentRepository.save(document);

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
        action: DocumentAction.SIGNATURE_REJECTED,
        updatedBy: userId,
        comment: rejectionReason,
      });

      await this.processFlowParticipantActionUseCase?.markSignerRejectedFromOtp(document.id, signature.userId, rejectionReason);
    }
  }
}
