import { DocumentRepository } from '@domains/document/repositories/document.repository';
import { DocumentHistoryRepository } from '@domains/document/repositories/document-history.repository';
import { DocumentAction } from '@domains/document/value-objects/document-enums';
import { SignatureRepository } from '../repositories/signature.repository';
import { SignatureVerificationCodeRepository } from '../repositories/signature-verification-code.repository';
import { SignatureStatus, SignatureRejectionCode } from '../value-objects/signature-enums';
import { SignatureCryptoService } from '@shared/security/signature-crypto.service';
import { NotFoundError, ValidationError } from '@shared/domain/errors';

export interface ValidateSignatureCodeParams {
  signatureId: string;
  code: string;
  ipAddress: string;
}

export class ValidateSignatureCodeUseCase {
  constructor(
    private readonly signatureRepository: SignatureRepository,
    private readonly signatureCodeRepository: SignatureVerificationCodeRepository,
    private readonly documentRepository: DocumentRepository,
    private readonly documentHistoryRepository: DocumentHistoryRepository,
    private readonly cryptoService: SignatureCryptoService,
  ) {}

  async execute(params: ValidateSignatureCodeParams): Promise<void> {
    const { signatureId, code, ipAddress } = params;

    const signature = await this.signatureRepository.findById(signatureId);
    if (!signature) {
      throw new NotFoundError('Proceso de firma no encontrado');
    }

    if (signature.status !== SignatureStatus.PENDING) {
      throw new ValidationError('El proceso de firma no está en estado pendiente');
    }

    const verificationCode = await this.signatureCodeRepository.findActiveBySignatureId(signatureId);
    if (!verificationCode) {
      throw new NotFoundError('No se encontró un código de verificación activo');
    }

    if (verificationCode.isExpired) {
      await this.rejectSignature(signature.id, signature.documentId, signature.userId, SignatureRejectionCode.CODE_EXPIRED, 'El código de verificación ha expirado');
      throw new ValidationError('El código de verificación ha expirado. Inicia el proceso de firma nuevamente.');
    }

    const isValid = this.cryptoService.verifyCode(code, verificationCode.codeHash, signatureId);

    if (!isValid) {
      verificationCode.attempts += 1;
      await this.signatureCodeRepository.update(verificationCode);

      if (verificationCode.hasExceededMaxAttempts) {
        await this.rejectSignature(signature.id, signature.documentId, signature.userId, SignatureRejectionCode.MAX_ATTEMPTS_EXCEEDED, `Número máximo de intentos (${verificationCode.maxAttempts}) alcanzado`);
        throw new ValidationError('Has superado el número máximo de intentos. Inicia el proceso de firma nuevamente.');
      }

      const remaining = verificationCode.maxAttempts - verificationCode.attempts;
      throw new ValidationError(`Código incorrecto. Te quedan ${remaining} intento(s).`);
    }

    const signedAt = new Date();
    const tokenHash = this.cryptoService.generateTokenHash({
      documentId: signature.documentId,
      userId: signature.userId,
      signedAt,
      ipAddress,
    });

    verificationCode.usedAt = signedAt;
    await this.signatureCodeRepository.update(verificationCode);

    signature.status = SignatureStatus.SIGNED;
    signature.tokenHash = tokenHash;
    signature.ipAddress = ipAddress;
    signature.signedAt = signedAt;
    signature.updatedAt = signedAt;
    await this.signatureRepository.update(signature);

    const document = await this.documentRepository.findById(signature.documentId);
    if (document) {
      document.updateSignatureStatus(SignatureStatus.SIGNED);
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
        action: DocumentAction.SIGNATURE_SIGNED,
        updatedBy: signature.userId,
        comment: `Documento firmado correctamente. IP: ${ipAddress}`,
      });
    }
  }

  private async rejectSignature(
    signatureId: string,
    documentId: string,
    userId: string,
    rejectionCode: SignatureRejectionCode,
    rejectionReason: string,
  ): Promise<void> {
    const signature = await this.signatureRepository.findById(signatureId);
    if (!signature) return;

    signature.status = SignatureStatus.REJECTED;
    signature.rejectionCode = rejectionCode;
    signature.rejectionReason = rejectionReason;
    signature.updatedAt = new Date();
    await this.signatureRepository.update(signature);

    const document = await this.documentRepository.findById(documentId);
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
    }
  }
}
