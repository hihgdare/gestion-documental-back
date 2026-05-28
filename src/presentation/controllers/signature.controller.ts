import { Request, Response } from 'express';
import { asyncHandler } from '@shared/middleware/validation';
import { InitiateSignatureUseCase } from '@domains/signature/use-cases/initiate-signature.use-case';
import { ValidateSignatureCodeUseCase } from '@domains/signature/use-cases/validate-signature-code.use-case';
import { CancelSignatureUseCase } from '@domains/signature/use-cases/cancel-signature.use-case';
import { GetSignatureByDocumentUseCase, GetSignatureByTokenHashUseCase } from '@domains/signature/use-cases/get-signature.use-case';
import { Signature } from '@domains/signature/entities/signature.entity';

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
  ) {}

  initiate = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { documentId, signatureType, signatureMethod } = req.body;
    const userId = req.auth!.user!.id;

    const result = await this.initiateSignatureUseCase.execute({
      documentId,
      userId,
      signatureType,
      signatureMethod,
    });

    res.status(201).json({
      success: true,
      data: result,
    });
  });

  validate = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { signatureId, code } = req.body;
    const ipAddress =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      '0.0.0.0';

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
