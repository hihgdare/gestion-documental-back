import { LandingSettingsRepository } from "../repositories/landing-settings.repository";
import { EmailQueueService } from "@shared/infrastructure/email/email-queue.service";
import { ValidationError } from "@shared/domain/errors";

export interface SubmitLandingContactInput {
  nombre: string;
  apellido: string;
  correo: string;
  cargo: string;
  empresa: string;
  telefono: string;
  mensaje: string;
}

const FIELD_LABELS: Record<keyof SubmitLandingContactInput, string> = {
  nombre: "Nombre",
  apellido: "Apellido",
  correo: "Correo",
  cargo: "Cargo",
  empresa: "Empresa",
  telefono: "Teléfono",
  mensaje: "Mensaje",
};

export class SubmitLandingContactUseCase {
  constructor(
    private readonly landingSettingsRepository: LandingSettingsRepository,
    private readonly emailQueueService: EmailQueueService,
  ) {}

  public async execute(input: SubmitLandingContactInput): Promise<void> {
    const settings = await this.landingSettingsRepository.getOrCreate();
    const recipients = settings.recipientEmails();

    if (recipients.length === 0) {
      throw new ValidationError("No hay correos de destino configurados para el formulario de contacto");
    }

    const rows = (Object.keys(FIELD_LABELS) as (keyof SubmitLandingContactInput)[])
      .map((key) => `<tr><td style="padding:6px 12px;font-weight:bold;color:#1a3c5e;">${FIELD_LABELS[key]}</td><td style="padding:6px 12px;">${escapeHtml(input[key])}</td></tr>`)
      .join("");

    await this.emailQueueService.enqueue({
      to: recipients,
      subject: `Nuevo contacto desde la landing – ${input.empresa}`,
      html: `<!DOCTYPE html><html lang="es"><body style="font-family:Arial,sans-serif;color:#333;">
        <h2 style="color:#1a3c5e;">Nuevo mensaje desde el formulario de contacto</h2>
        <table cellpadding="0" cellspacing="0">${rows}</table>
      </body></html>`,
      text: (Object.keys(FIELD_LABELS) as (keyof SubmitLandingContactInput)[])
        .map((key) => `${FIELD_LABELS[key]}: ${input[key]}`)
        .join("\n"),
    });
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
