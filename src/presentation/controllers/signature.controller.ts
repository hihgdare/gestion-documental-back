import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { asyncHandler } from '@shared/middleware/validation';
import { InitiateSignatureUseCase } from '@domains/signature/use-cases/initiate-signature.use-case';
import { ValidateSignatureCodeUseCase } from '@domains/signature/use-cases/validate-signature-code.use-case';
import { CancelSignatureUseCase } from '@domains/signature/use-cases/cancel-signature.use-case';
import { GetSignatureByDocumentUseCase, GetSignatureByTokenHashUseCase } from '@domains/signature/use-cases/get-signature.use-case';
import { VerifyDocumentSignatureUseCase } from '@domains/signature/use-cases/verify-document-signature.use-case';
import { GetSignatureSmsPhoneUseCase } from '@domains/signature/use-cases/get-signature-sms-phone.use-case';
import { TypeOrmFileRepository } from '@shared/infrastructure/repositories/typeorm-file.repository';
import { Signature } from '@domains/signature/entities/signature.entity';
import { extractClientIp } from '@shared/utils/ip';
import { NotFoundError, ServerError } from '@shared/domain/errors';

interface SignatureResponseDto {
  id: string;
  documentId: string;
  userId: string;
  signatureType: string;
  signatureMethod: string;
  status: string;
  tokenHash: string | null;
  ipAddress: string | null;
  rejectionReason: string | null;
  rejectionCode: string | null;
  signedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export class SignatureController {
  constructor(
    private readonly initiateSignatureUseCase: InitiateSignatureUseCase,
    private readonly validateSignatureCodeUseCase: ValidateSignatureCodeUseCase,
    private readonly cancelSignatureUseCase: CancelSignatureUseCase,
    private readonly getSignatureByDocumentUseCase: GetSignatureByDocumentUseCase,
    private readonly getSignatureByTokenHashUseCase: GetSignatureByTokenHashUseCase,
    private readonly verifyDocumentSignatureUseCase: VerifyDocumentSignatureUseCase,
    private readonly getSignatureSmsPhoneUseCase: GetSignatureSmsPhoneUseCase,
    private readonly fileRepository?: TypeOrmFileRepository,
  ) {}

  initiate = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { documentId, signatureType, signatureMethod, phoneNumber } = req.body;
    const userId = req.auth!.user!.id;

    const result = await this.initiateSignatureUseCase.execute({
      documentId,
      userId,
      signatureType,
      signatureMethod,
      phoneNumber,
    });

    res.status(201).json({
      success: true,
      data: result,
    });
  });

  validate = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { signatureId, code } = req.body;
    const ipAddress = extractClientIp(req);

    await this.validateSignatureCodeUseCase.execute({
      signatureId,
      code,
      ipAddress,
    });

    res.status(200).json({
      success: true,
      message: 'Documento firmado exitosamente',
    });
  });

  cancel = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { signatureId } = req.body;
    const userId = req.auth!.user!.id;

    await this.cancelSignatureUseCase.execute({ signatureId, userId });

    res.status(200).json({
      success: true,
      message: 'Proceso de firma cancelado',
    });
  });

  getDefaultSmsPhone = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.auth!.user!.id;
    const result = await this.getSignatureSmsPhoneUseCase.execute(userId);

    res.status(200).json({
      success: true,
      data: result,
    });
  });

  getByDocument = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { documentId } = req.params;
    const signatures = await this.getSignatureByDocumentUseCase.execute(documentId);

    res.status(200).json({
      success: true,
      data: signatures.map((s) => this.toResponseDto(s)),
      count: signatures.length,
    });
  });

  verifyByToken = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { tokenHash } = req.params;
    const signature = await this.getSignatureByTokenHashUseCase.execute(tokenHash);

    res.status(200).json({
      success: true,
      data: this.toResponseDto(signature),
    });
  });

  verifyByDocumentAndToken = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { documentId, tokenHash } = req.params;
    const result = await this.verifyDocumentSignatureUseCase.execute(documentId, tokenHash);

    res.status(200).json({
      success: true,
      data: {
        signature: this.toResponseDto(result.signature),
        document: result.document,
        isExpired: result.isExpired,
      },
    });
  });

  getDocumentFileByVerification = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { documentId, tokenHash } = req.params;

    // Validate the pair exists before serving the file
    const result = await this.verifyDocumentSignatureUseCase.execute(documentId, tokenHash);

    const documentUrl = result.document.documentUrl;
    if (!documentUrl) {
      throw new NotFoundError('El documento no tiene archivo asociado');
    }

    const filePath = await this.resolveFilePath(documentUrl);
    if (!filePath) {
      throw new NotFoundError('Archivo del documento no disponible');
    }

    if (!fs.existsSync(filePath)) {
      throw new NotFoundError('Archivo del documento no encontrado en el servidor');
    }

    try {
      const ext = path.extname(filePath).toLowerCase();
      const mimeType = ext === '.pdf' ? 'application/pdf' : 'application/octet-stream';
      const fileName = path.basename(filePath);
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(fileName)}"`);
      const stream = fs.createReadStream(filePath);
      stream.pipe(res);
    } catch {
      throw new ServerError('Error al servir el archivo del documento');
    }
  });

  private async resolveFilePath(documentUrl: string): Promise<string | null> {
    if (documentUrl.toLowerCase().endsWith('.pdf') && path.isAbsolute(documentUrl)) {
      return documentUrl;
    }

    if (!this.fileRepository) return null;

    const file = await this.fileRepository.findById(documentUrl);
    if (!file) return null;

    if (file.storage !== 'local') return null;

    return file.path;
  }

  private toResponseDto(signature: Signature): SignatureResponseDto {
    return {
      id: signature.id,
      documentId: signature.documentId,
      userId: signature.userId,
      signatureType: signature.signatureType,
      signatureMethod: signature.signatureMethod,
      status: signature.status,
      tokenHash: signature.tokenHash,
      ipAddress: signature.ipAddress,
      rejectionReason: signature.rejectionReason,
      rejectionCode: signature.rejectionCode,
      signedAt: signature.signedAt ? signature.signedAt.toISOString() : null,
      createdAt: signature.createdAt.toISOString(),
      updatedAt: signature.updatedAt.toISOString(),
    };
  }
}
