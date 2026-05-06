import { UserRepository } from '@domains/user/repositories/user.repository';
import { EmailService } from '@shared/infrastructure/email/email-service.interface';
import { NotFoundError, ServerError } from '@shared/domain/errors';
import { UserStatus } from '@domains/user/value-objects/user-status';
import jwt from 'jsonwebtoken';

export class SendActivationEmailUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly emailService: EmailService,
  ) {}

  async execute(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User', userId);
    }

    if (user.status !== UserStatus.ACTIVE) {
      return; // Only send activation email to newly activated users
    }

    const secret = process.env.JWT_SECRET;
    const frontendUrl = process.env.FRONTEND_URL;

    if (!secret || !frontendUrl) {
      // Email service not fully configured — skip silently
      return;
    }

    const token = jwt.sign(
      { userId: user.id, purpose: 'set-password' },
      secret,
      { expiresIn: '48h' },
    );

    const setPasswordUrl = `${frontendUrl}/set-password?token=${token}`;

    const sent = await this.emailService.send({
      to: user.email.toString(),
      subject: 'Tu cuenta ha sido activada',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <p>Hola ${user.firstName},</p>
          <p>Tu cuenta en el sistema de Gestión Documental ha sido activada.</p>
          <p>Para comenzar, debes establecer tu contraseña haciendo clic en el siguiente enlace:</p>
          <p style="margin: 24px 0;">
            <a href="${setPasswordUrl}"
               style="background-color: #1a56db; color: #ffffff; padding: 12px 24px; border-radius: 4px; text-decoration: none; font-weight: bold;">
              Configurar contraseña
            </a>
          </p>
          <p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
          <p style="word-break: break-all; color: #555; font-size: 13px;">${setPasswordUrl}</p>
          <p>Este enlace es válido por <strong>48 horas</strong>.</p>
          <p>Si no esperabas este mensaje, puedes ignorarlo.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
          <p style="color: #888; font-size: 12px;">El equipo de Primacta</p>
        </div>
      `,
      text: `Hola ${user.firstName},\n\nTu cuenta ha sido activada. Configura tu contraseña en el siguiente enlace:\n${setPasswordUrl}\n\nEste enlace es válido por 48 horas. Si no esperabas este mensaje, ignóralo.\n\nEl equipo de Primacta`,
    });

    if (!sent) {
      throw new ServerError('Failed to send activation email');
    }
  }
}
