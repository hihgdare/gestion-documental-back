import { Request, Response, NextFunction } from 'express';
import { GetExternalParticipantAccessUseCase } from '@domains/signature-flow/use-cases/external-participant-access.use-case';
import { SubmitExternalParticipantActionUseCase } from '@domains/signature-flow/use-cases/external-participant-access.use-case';
import { RequestExternalSignerOtpUseCase } from '@domains/signature-flow/use-cases/external-participant-access.use-case';
import { ValidateExternalSignerOtpUseCase } from '@domains/signature-flow/use-cases/external-participant-access.use-case';
import { TypeOrmFileRepository } from '@shared/infrastructure/repositories/typeorm-file.repository';
import { ValidationError } from '@shared/domain/errors';
import path from 'path';
import fs from 'fs';

export class ExternalParticipantController {
  constructor(
    private readonly getAccessUseCase: GetExternalParticipantAccessUseCase,
    private readonly submitActionUseCase: SubmitExternalParticipantActionUseCase,
    private readonly requestOtpUseCase: RequestExternalSignerOtpUseCase,
    private readonly validateOtpUseCase: ValidateExternalSignerOtpUseCase,
    private readonly fileRepository: TypeOrmFileRepository,
  ) {
    this.getAccess = this.getAccess.bind(this);
    this.getDocument = this.getDocument.bind(this);
    this.submitAction = this.submitAction.bind(this);
    this.requestOtp = this.requestOtp.bind(this);
    this.validateOtp = this.validateOtp.bind(this);
  }

  async getAccess(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = req.params;
      const result = await this.getAccessUseCase.execute(token);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = req.params;
      const info = await this.getAccessUseCase.execute(token);

      if (info.status !== 'valid' && info.status !== 'already_used') {
        res.status(403).json({ message: 'Acceso no válido al documento.' });
        return;
      }

      const documentUrl = info.document?.documentUrl;
      if (!documentUrl) {
        res.status(404).json({ message: 'El documento no tiene archivo adjunto.' });
        return;
      }

      await this.serveDocumentFile(documentUrl, true, res, next);
    } catch (err) {
      next(err);
    }
  }

  async submitAction(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = req.params;
      const { action, comment } = req.body as { action: 'approve' | 'reject'; comment?: string };

      if (!action || !['approve', 'reject'].includes(action)) {
        throw new ValidationError('La acción debe ser "approve" o "reject".');
      }

      await this.submitActionUseCase.execute(token, action, comment);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  }

  async requestOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = req.params;
      const result = await this.requestOtpUseCase.execute(token);
      res.json({ success: true, redactedEmail: result.redactedEmail });
    } catch (err) {
      next(err);
    }
  }

  async validateOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = req.params;
      const { code } = req.body as { code: string };
      const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim()
        || req.socket.remoteAddress
        || 'unknown';

      if (!code || typeof code !== 'string' || code.length !== 6) {
        throw new ValidationError('El código debe ser de 6 dígitos.');
      }

      await this.validateOtpUseCase.execute(token, code, ipAddress);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  }

  async serveDocumentFile(
    documentUrl: string,
    inline: boolean,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const file = await this.fileRepository.findById(documentUrl);
      if (!file) {
        res.status(404).json({ message: 'Archivo no encontrado.' });
        return;
      }

      if (file.storage !== 'local') {
        res.status(400).json({ message: 'Solo se admiten archivos locales.' });
        return;
      }

      const uploadDir = process.env.FILE_STORAGE_LOCAL_PATH ?? './uploads';
      const fullPath = path.isAbsolute(file.path) ? file.path : path.join(uploadDir, file.path);

      if (!fs.existsSync(fullPath)) {
        res.status(404).json({ message: 'Archivo físico no encontrado.' });
        return;
      }

      const disposition = inline ? 'inline' : `attachment; filename="${encodeURIComponent(file.originalName)}"`;
      res.setHeader('Content-Type', file.mimeType ?? 'application/octet-stream');
      res.setHeader('Content-Disposition', disposition);
      fs.createReadStream(fullPath).pipe(res);
    } catch (err) {
      next(err);
    }
  }
}
