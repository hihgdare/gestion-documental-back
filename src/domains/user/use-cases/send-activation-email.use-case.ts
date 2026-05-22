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

    await this.userRepository.updatePasswordNonce(user.id, nonce);

    const token = jwt.sign(
      { userId: user.id, nonce, purpose: 'set-password' },
      this.jwtSecret,
      { expiresIn: '48h' },
    );

    const setPasswordUrl = `${this.frontendUrl}/set-password?token=${token}`;

    const year = new Date().getFullYear();
    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Tu cuenta ha sido activada – Primacta</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background-color:#1a3c5e;padding:32px 40px;text-align:center;">
              <h1 style="color:#ffffff;margin:0;font-size:26px;letter-spacing:1px;font-weight:bold;">Primacta</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;color:#333333;line-height:1.7;">
              <h2 style="color:#1a3c5e;margin-top:0;font-size:20px;">Hola, ${user.firstName}</h2>
              <p style="margin:0 0 16px;">
                Tu cuenta en <a href="https://www.primacta.com" style="color:#1a3c5e;font-weight:bold;text-decoration:none;">Primacta</a>
                ha sido activada exitosamente.
              </p>
              <p style="margin:0 0 24px;">
                Para comenzar a utilizar la plataforma, debes establecer tu contraseña
                haciendo clic en el botón a continuación:
              </p>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
                <tr>
                  <td style="border-radius:6px;background-color:#1a3c5e;">
                    <a href="${setPasswordUrl}"
                       target="_blank"
                       style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:15px;font-weight:bold;text-decoration:none;border-radius:6px;letter-spacing:0.5px;">
                      Configurar mi contraseña
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Fallback link -->
              <table cellpadding="0" cellspacing="0" style="background-color:#f0f4f8;border-left:4px solid #1a3c5e;border-radius:4px;margin:0 0 24px;width:100%;">
                <tr>
                  <td style="padding:14px 20px;">
                    <p style="margin:0 0 6px;font-size:13px;color:#555;">Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
                    <p style="margin:0;font-size:12px;word-break:break-all;">
                      <a href="${setPasswordUrl}" style="color:#1a3c5e;">${setPasswordUrl}</a>
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Warning note -->
              <table cellpadding="0" cellspacing="0" style="background-color:#fff8e1;border-left:4px solid #f9a825;border-radius:4px;margin:0 0 24px;width:100%;">
                <tr>
                  <td style="padding:12px 20px;font-size:14px;color:#555;">
                    &#128274; Este enlace es válido por <strong>48 horas</strong>. Si expira, solicita un nuevo correo de activación a tu administrador.
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 8px;font-size:14px;color:#888;">
                Si no esperabas este mensaje, puedes ignorarlo sin problema.
              </p>
              <p style="margin:24px 0 0;">
                Saludos cordiales,<br />
                <strong style="color:#1a3c5e;">Equipo Primacta</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f4f4f4;text-align:center;padding:20px 40px;font-size:12px;color:#999;">
              © ${year} Primacta &nbsp;·&nbsp; Este es un correo automático, por favor no respondas a este mensaje.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const sent = await this.emailService.send({
      to: user.email.toString(),
      subject: 'Tu cuenta ha sido activada – Primacta',
      html,
      text: `Hola ${user.firstName},\n\nTu cuenta en Primacta ha sido activada.\n\nEstablece tu contraseña en el siguiente enlace:\n${setPasswordUrl}\n\nEste enlace es válido por 48 horas.\n\nSi no esperabas este mensaje, ignóralo.\n\nSaludos cordiales,\nEquipo Primacta`,
    });

    if (!sent) {
      throw new ServerError('Failed to send activation email');
    }
  }
}

