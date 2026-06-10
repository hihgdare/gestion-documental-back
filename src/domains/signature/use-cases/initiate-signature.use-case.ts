import { DocumentRepository } from '@domains/document/repositories/document.repository';
import { DocumentHistoryRepository } from '@domains/document/repositories/document-history.repository';
import { SignatureRepository } from '../repositories/signature.repository';
import { SignatureVerificationCodeRepository } from '../repositories/signature-verification-code.repository';
import { Signature } from '../entities/signature.entity';
import { SignatureVerificationCode } from '../entities/signature-verification-code.entity';
import { SignatureStatus, SignatureType, SignatureMethod } from '../value-objects/signature-enums';
import { SignatureCryptoService } from '@shared/security/signature-crypto.service';
import { EmailService } from '@shared/infrastructure/email/email-service.interface';
import { UserRepository } from '@domains/user/repositories/user.repository';
import { ColaboratorRepository } from '@domains/colaborators/repositories/colaborator.repository';
import { SignatureFlowRepository } from '@domains/signature-flow/repositories/signature-flow.repository';
import { SignatureFlowParticipantRepository } from '@domains/signature-flow/repositories/signature-flow-participant.repository';
import {
  SignatureFlowOrderType,
  SignatureFlowParticipantRole,
  SignatureFlowParticipantStatus,
  SignatureFlowStatus,
} from '@domains/signature-flow/value-objects/signature-flow-enums';
import { NotFoundError, ValidationError } from '@shared/domain/errors';

const OTP_EXPIRY_MINUTES = 5;
const MAX_ATTEMPTS = 3;

export interface InitiateSignatureParams {
  documentId: string;
  userId: string;
  signatureType?: SignatureType;
  signatureMethod?: SignatureMethod;
  phoneNumber?: string;
}

export interface InitiateSignatureResult {
  signatureId: string;
}

export class InitiateSignatureUseCase {
  constructor(
    private readonly signatureRepository: SignatureRepository,
    private readonly signatureCodeRepository: SignatureVerificationCodeRepository,
    private readonly documentRepository: DocumentRepository,
    private readonly documentHistoryRepository: DocumentHistoryRepository,
    private readonly userRepository: UserRepository,
    private readonly colaboratorRepository: ColaboratorRepository,
    private readonly signatureFlowRepository: SignatureFlowRepository,
    private readonly signatureFlowParticipantRepository: SignatureFlowParticipantRepository,
    private readonly cryptoService: SignatureCryptoService,
    private readonly emailService: EmailService,
  ) {}

  async execute(params: InitiateSignatureParams): Promise<InitiateSignatureResult> {
    const {
      documentId,
      userId,
      signatureType = SignatureType.SIMPLE,
      signatureMethod = SignatureMethod.EMAIL,
      phoneNumber,
    } = params;

    const document = await this.documentRepository.findById(documentId);
    if (!document) {
      throw new NotFoundError('Documento no encontrado');
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('Usuario no encontrado');
    }

    if (signatureMethod === SignatureMethod.EMAIL && !user.email) {
      throw new ValidationError('El usuario no tiene un correo electrónico registrado');
    }

    const activeFlow = await this.signatureFlowRepository.findActiveByDocumentId(documentId);
    if (activeFlow) {
      if (activeFlow.status === SignatureFlowStatus.IN_REVIEW) {
        throw new ValidationError('El documento aún está en etapa de revisión y no puede firmarse');
      }

      if (activeFlow.status !== SignatureFlowStatus.IN_SIGNING) {
        throw new ValidationError('El flujo de firma no está disponible para firmar en este momento');
      }

      const participants = await this.signatureFlowParticipantRepository.findByFlowId(activeFlow.id);
      const pendingSigner = participants.find((participant) => (
        participant.role === SignatureFlowParticipantRole.SIGNER
        && participant.userId === userId
        && participant.status === SignatureFlowParticipantStatus.PENDING
        && this.isCurrentStepSigner(participant, participants, activeFlow.orderType)
      ));

      if (!pendingSigner) {
        throw new ValidationError('No tienes una firma pendiente en el flujo activo para este documento');
      }
    }

    const colaborator = await this.colaboratorRepository.findByUserId(userId);
    if (!colaborator) {
      throw new ValidationError(
        'El usuario no está asociado a ningún colaborador. No es posible confirmar la identidad del firmante.',
      );
    }

    const signature = Signature.create({
      documentId,
      userId,
      signatureType,
      signatureMethod,
      status: SignatureStatus.PENDING,
    });

    const savedSignature = await this.signatureRepository.save(signature);

    const otpCode = this.cryptoService.generateOtpCode();
    const codeHash = this.cryptoService.hashCode(otpCode, savedSignature.id);

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + OTP_EXPIRY_MINUTES);

    const verificationCode = SignatureVerificationCode.create({
      signatureId: savedSignature.id,
      codeHash,
      attempts: 0,
      maxAttempts: MAX_ATTEMPTS,
      expiresAt,
    });

    await this.signatureCodeRepository.save(verificationCode);

    document.updateSignatureStatus(SignatureStatus.PENDING);
    await this.documentRepository.save(document);

    if (signatureMethod === SignatureMethod.SMS) {
      const resolvedPhone = (phoneNumber?.trim() || colaborator.telefono?.trim() || '');
      if (!resolvedPhone) {
        throw new ValidationError('No existe un telefono disponible para enviar el codigo SMS.');
      }

      const smsSent = await this.sendSmsCode(resolvedPhone, otpCode);
      if (!smsSent) {
        console.warn(`[InitiateSignatureUseCase] No se pudo enviar SMS al usuario ${userId} para el documento ${documentId}`);
      }
    } else {
      const emailSent = await this.emailService.send({
        to: user.email.toString(),
        subject: 'Código de verificación para firma de documento',
        html: this.buildEmailHtml(otpCode, document.name, OTP_EXPIRY_MINUTES),
        text: `Su código de verificación es: ${otpCode}. Válido por ${OTP_EXPIRY_MINUTES} minutos.`,
      });

      if (!emailSent) {
        console.warn(`[InitiateSignatureUseCase] No se pudo enviar el email al usuario ${userId} para el documento ${documentId}`);
      }
    }

    return { signatureId: savedSignature.id };
  }

  private isCurrentStepSigner(
    participant: { order: number | null },
    participants: Array<{ role: string; status: string; order: number | null }>,
    orderType: SignatureFlowOrderType,
  ): boolean {
    if (orderType !== SignatureFlowOrderType.SEQUENTIAL) return true;
    if (participant.order === null) return true;

    const pendingOrders = participants
      .filter((p) => p.role === SignatureFlowParticipantRole.SIGNER)
      .filter((p) => p.status === SignatureFlowParticipantStatus.PENDING)
      .filter((p) => p.order !== null)
      .map((p) => p.order as number);

    if (pendingOrders.length === 0) return true;

    return participant.order === Math.min(...pendingOrders);
  }

  private buildEmailHtml(code: string, documentName: string, expiryMinutes: number): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #1a1a1a;">Código de verificación de firma</h2>
        <p>Has iniciado el proceso de firma para el documento:</p>
        <p style="font-weight: bold;">${documentName}</p>
        <p>Tu código de verificación es:</p>
        <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #2563eb;
                    background: #f0f4ff; padding: 16px 24px; border-radius: 8px;
                    text-align: center; margin: 16px 0;">
          ${code}
        </div>
        <p style="color: #666; font-size: 14px;">
          Este código es válido por ${expiryMinutes} minutos y solo puede utilizarse una vez.
          No lo compartas con nadie.
        </p>
      </div>
    `;
  }

  private async sendSmsCode(phoneNumber: string, otpCode: string): Promise<boolean> {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;
    const smsProvider = process.env.SMS_PROVIDER?.toLowerCase();

    if (smsProvider !== 'twilio') {
      throw new ValidationError('El proveedor SMS configurado no es compatible. Usa SMS_PROVIDER=twilio.');
    }

    if (!accountSid || !authToken || !fromNumber) {
      throw new ValidationError('Configuracion incompleta de Twilio para envio de SMS.');
    }

    try {
      const twilioModule = await import('twilio');
      const client = twilioModule.default(accountSid, authToken);
      await client.messages.create({
        body: `Tu codigo de verificacion es: ${otpCode}`,
        from: fromNumber,
        to: phoneNumber,
      });
      return true;
    } catch (error) {
      console.warn('[InitiateSignatureUseCase] Error al enviar SMS por Twilio:', error);
      return false;
    }
  }
}
