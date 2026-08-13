import { DocumentRepository } from '@domains/document/repositories/document.repository';
import { DocumentHistoryRepository } from '@domains/document/repositories/document-history.repository';
import { DocumentAction } from '@domains/document/value-objects/document-enums';
import { UserRepository } from '@domains/user/repositories/user.repository';
import { ColaboratorRepository } from '@domains/colaborators/repositories/colaborator.repository';
import { SignatureRepository } from '../repositories/signature.repository';
import { SignatureVerificationCodeRepository } from '../repositories/signature-verification-code.repository';
import { SignatureStatus, SignatureRejectionCode } from '../value-objects/signature-enums';
import { SignatureCryptoService } from '@shared/security/signature-crypto.service';
import { SignaturePdfStampService } from '@shared/infrastructure/pdf/signature-pdf-stamp.service';
import { TypeOrmFileRepository } from '@shared/infrastructure/repositories/typeorm-file.repository';
import { ProcessFlowParticipantActionUseCase } from '@domains/signature-flow/use-cases/progress-signature-flow.use-case';
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
    private readonly userRepository: UserRepository,
    private readonly colaboratorRepository: ColaboratorRepository,
    private readonly processFlowParticipantActionUseCase?: ProcessFlowParticipantActionUseCase,
    private readonly pdfStampService?: SignaturePdfStampService,
    private readonly fileRepository?: TypeOrmFileRepository,
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
      await this.registerSignatureError(
        signature.id,
        signature.documentId,
        signature.userId,
        SignatureRejectionCode.CODE_EXPIRED,
        'Error en proceso de firma: codigo expirado',
      );
      throw new ValidationError('El código de verificación ha expirado. Inicia el proceso de firma nuevamente.');
    }

    const isValid = this.cryptoService.verifyCode(code, verificationCode.codeHash, signatureId);

    if (!isValid) {
      verificationCode.attempts += 1;
      await this.signatureCodeRepository.update(verificationCode);

      if (verificationCode.hasExceededMaxAttempts) {
        await this.registerSignatureError(
          signature.id,
          signature.documentId,
          signature.userId,
          SignatureRejectionCode.MAX_ATTEMPTS_EXCEEDED,
          'Error en proceso de firma: maximo de intentos alcanzado',
        );
        throw new ValidationError('Has superado el número máximo de intentos. Inicia el proceso de firma nuevamente.');
      }

      await this.registerSignatureError(
        signature.id,
        signature.documentId,
        signature.userId,
        undefined,
        'Error en proceso de firma: codigo ingresado incorrecto',
      );

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

    const wasPartOfFlow = this.processFlowParticipantActionUseCase
      ? await this.processFlowParticipantActionUseCase.markSignerSignedFromOtp(signature.documentId, signature.userId, signedAt)
      : false;

    const document = await this.documentRepository.findById(signature.documentId);
    if (document) {
      document.updateSignatureStatus(SignatureStatus.SIGNED);
      await this.documentRepository.save(document);

      if (!wasPartOfFlow) {
        await this.tryStampPdf(document.documentUrl, signature.documentId, signature.userId, tokenHash, ipAddress, signedAt);
      }
    }
  }

  private async tryStampPdf(
    documentUrl: string | undefined,
    documentId: string,
    userId: string,
    tokenHash: string,
    ipAddress: string,
    signedAt: Date,
  ): Promise<void> {
    if (!this.pdfStampService || !documentUrl) return;

    const pdfPath = await this.resolvePdfPath(documentUrl);
    if (!pdfPath) return;

    try {
      const user = await this.userRepository.findById(userId);
      if (!user) return;

      const colaborator = await this.colaboratorRepository.findByUserId(userId);
      const signerDocumentNumber = colaborator?.numeroDocumento ?? 'N/A';

      const verifyUrl = this.buildVerifyUrl(documentId, tokenHash);

      await this.pdfStampService.stampPdf(pdfPath, {
        signerName: `${user.firstName} ${user.lastName}`,
        signerDocumentNumber,
        signerEmail: String(user.email),
        signedAt,
        ipAddress,
        documentId,
        tokenHash,
        verifyUrl,
      });
    } catch (err) {
      console.warn('[ValidateSignatureCodeUseCase] PDF stamping failed (non-critical):', err);
    }
  }

  private async resolvePdfPath(documentUrl: string): Promise<string | null> {
    if (documentUrl.toLowerCase().endsWith('.pdf')) {
      return documentUrl;
    }

    if (!this.fileRepository) return null;

    const file = await this.fileRepository.findById(documentUrl);
    if (!file) return null;

    const isPdfByMime = (file.mimeType ?? '').toLowerCase().includes('pdf');
    const isPdfByName = file.originalName.toLowerCase().endsWith('.pdf');
    const isPdfByPath = file.path.toLowerCase().endsWith('.pdf');
    const isPdf = isPdfByMime || isPdfByName || isPdfByPath;

    if (!isPdf) return null;

    if (file.storage !== 'local') {
      console.warn('[ValidateSignatureCodeUseCase] PDF stamping skipped: only local storage is currently supported.');
      return null;
    }

    return file.path;
  }

  private buildVerifyUrl(documentId: string, tokenHash: string): string {
    const baseUrl = (process.env.FRONTEND_URL ?? '').replace(/\/$/, '');
    return baseUrl ? `${baseUrl}/verify/${documentId}/${tokenHash}` : `/verify/${documentId}/${tokenHash}`;
  }

  private async registerSignatureError(
    signatureId: string,
    documentId: string,
    userId: string,
    rejectionCode: SignatureRejectionCode | undefined,
    errorReason: string,
  ): Promise<void> {
    const signature = await this.signatureRepository.findById(signatureId);
    if (!signature) return;

    // Signature keeps PENDING status to allow the user to re-initiate after failure
    signature.status = SignatureStatus.PENDING;
    signature.rejectionCode = rejectionCode ?? null;
    signature.rejectionReason = null;
    signature.updatedAt = new Date();
    await this.signatureRepository.update(signature);

    const activeCode = await this.signatureCodeRepository.findActiveBySignatureId(signatureId);
    if (activeCode && (activeCode.isExpired || activeCode.hasExceededMaxAttempts)) {
      activeCode.usedAt = new Date();
      await this.signatureCodeRepository.update(activeCode);
    }

    const document = await this.documentRepository.findById(documentId);
    if (document) {
      document.updateSignatureStatus(SignatureStatus.PENDING);
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
        action: DocumentAction.SIGNATURE_ERROR,
        updatedBy: userId,
        comment: errorReason,
      });
    }
  }
}
