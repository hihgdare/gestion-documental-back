import { UserRepository } from '@domains/user/repositories/user.repository';
import { EmailService } from '@shared/infrastructure/email/email-service.interface';
import { NotFoundError, ServerError } from '@shared/domain/errors';
import { UserStatus } from '@domains/user/value-objects/user-status';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export class SendActivationEmailUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly emailService: EmailService,
    private readonly jwtSecret: string,
    private readonly frontendUrl: string,
  ) {}

  async execute(userId: string): Promise<void> {
    if (!this.frontendUrl) {
      throw new ServerError('FRONTEND_URL is not configured — cannot generate activation link');
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User', userId);
    }

    if (user.status !== UserStatus.ACTIVE) {
      return; // Solo enviar si el usuario está activo (el cambio de estado ya ocurrió antes de invocar este use-case)
    }

    // Generate a one-time nonce tied to this specific activation link.
    // Saving it to the DB before signing ensures the token is invalidated
    // as soon as the user sets their password (nonce is rotated to null).
    const nonce = crypto.randomUUID();

    await this.userRepository.update({
      id: user.id,
      email: user.email.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      password: user.password,
      status: user.status,
      passwordNonce: nonce,
      roles: user.roles,
      groups: user.groups,
      createdAt: user.createdAt,
      updatedAt: new Date(),
      deletedAt: user.deletedAt,
    });

    const token = jwt.sign(
      { userId: user.id, nonce, purpose: 'set-password' },
      this.jwtSecret,
      { expiresIn: '48h' },
    );

    const setPasswordUrl = `${this.frontendUrl}/set-password?token=${token}`;

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

