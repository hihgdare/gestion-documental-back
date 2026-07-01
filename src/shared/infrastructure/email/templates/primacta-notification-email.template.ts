interface PrimactaNotificationEmailParams {
  title: string;
  recipientName?: string | null;
  message: string;
  actionLabel?: string;
  actionUrl?: string;
  warningMessage?: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function buildPrimactaNotificationEmail(params: PrimactaNotificationEmailParams): string {
  const year = new Date().getFullYear();
  const safeTitle = escapeHtml(params.title);
  const safeMessage = escapeHtml(params.message);
  const safeRecipient = params.recipientName ? escapeHtml(params.recipientName) : null;
  const safeActionLabel = params.actionLabel ? escapeHtml(params.actionLabel) : null;
  const safeActionUrl = params.actionUrl ? escapeHtml(params.actionUrl) : null;
  const safeWarning = params.warningMessage ? escapeHtml(params.warningMessage) : null;

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${safeTitle} - Primacta</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <tr>
            <td style="background-color:#1a3c5e;padding:32px 40px;text-align:center;">
              <h1 style="color:#ffffff;margin:0;font-size:26px;letter-spacing:1px;font-weight:bold;">Primacta</h1>
            </td>
          </tr>

          <tr>
            <td style="padding:36px 40px;color:#333333;line-height:1.7;">
              <h2 style="color:#1a3c5e;margin-top:0;font-size:20px;">${safeTitle}</h2>
              ${safeRecipient ? `<p style="margin:0 0 16px;">Hola, <strong>${safeRecipient}</strong></p>` : ""}
              <p style="margin:0 0 20px;">${safeMessage}</p>

              ${safeActionUrl && safeActionLabel ? `
                <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                  <tr>
                    <td style="border-radius:6px;background-color:#1a3c5e;">
                      <a href="${safeActionUrl}" target="_blank" style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:15px;font-weight:bold;text-decoration:none;border-radius:6px;letter-spacing:0.5px;">
                        ${safeActionLabel}
                      </a>
                    </td>
                  </tr>
                </table>

                <table cellpadding="0" cellspacing="0" style="background-color:#f0f4f8;border-left:4px solid #1a3c5e;border-radius:4px;margin:0 0 20px;width:100%;">
                  <tr>
                    <td style="padding:14px 20px;">
                      <p style="margin:0 0 6px;font-size:13px;color:#555;">Si el boton no funciona, copia y pega este enlace en tu navegador:</p>
                      <p style="margin:0;font-size:12px;word-break:break-all;">
                        <a href="${safeActionUrl}" style="color:#1a3c5e;">${safeActionUrl}</a>
                      </p>
                    </td>
                  </tr>
                </table>
              ` : ""}

              ${safeWarning ? `
                <table cellpadding="0" cellspacing="0" style="background-color:#fff8e1;border-left:4px solid #f9a825;border-radius:4px;margin:0 0 20px;width:100%;">
                  <tr>
                    <td style="padding:12px 20px;font-size:14px;color:#555;">
                      ${safeWarning}
                    </td>
                  </tr>
                </table>
              ` : ""}

              <p style="margin:24px 0 0;">Saludos cordiales,<br /><strong style="color:#1a3c5e;">Equipo Primacta</strong></p>
            </td>
          </tr>

          <tr>
            <td style="background-color:#f4f4f4;text-align:center;padding:20px 40px;font-size:12px;color:#999;">
              &copy; ${year} Primacta &nbsp;&middot;&nbsp; Este es un correo automatico, por favor no respondas a este mensaje.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function buildFrontendUrl(path: string): string | undefined {
  const baseUrl = (process.env.FRONTEND_URL ?? "").trim().replace(/\/$/, "");
  if (!baseUrl) return undefined;

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
}
