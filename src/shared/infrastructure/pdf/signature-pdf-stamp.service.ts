import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import QRCode from 'qrcode';
import path from 'path';
import fs from 'fs';

export interface SignatureStampData {
  signerName: string;
  signerDocumentNumber: string;
  signerEmail: string;
  signedAt: Date;
  ipAddress: string;
  documentId: string;
  tokenHash: string;
  verifyUrl: string;
}

export interface SignerStampData {
  signerName: string;
  signerDocumentNumber: string;
  signerEmail: string;
  signedAt: Date;
  ipAddress: string;
  tokenHash: string;
  verifyUrl: string;
}

export interface ValidatorStampData {
  validatorName: string;
  actionAt: Date;
}

export interface ConsolidatedStampData {
  documentId: string;
  completedAt: Date;
  validators: ValidatorStampData[];
  signers: SignerStampData[];
}

export class SignaturePdfStampService {
  async stampPdf(pdfPath: string, data: SignatureStampData): Promise<void> {
    const fullPath = this.resolveLocalPath(pdfPath);

    const pdfBytes = await fs.promises.readFile(fullPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);

    const qrBuffer: Buffer = await QRCode.toBuffer(data.verifyUrl, {
      errorCorrectionLevel: 'M',
      width: 200,
      margin: 1,
    });

    const qrImage = await pdfDoc.embedPng(qrBuffer);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const pages = pdfDoc.getPages();
    const { width } = pages[pages.length - 1].getSize();

    const MARGIN = 20;
    const STAMP_H = 174;
    const PADDING = 8;
    const QR_SIZE = 78;

    // Add a dedicated new page for the signature stamp so it never overlaps
    // existing content (e.g. page numbers on the last page).
    const stampPageHeight = STAMP_H + MARGIN * 4;
    const stampPage = pdfDoc.addPage([width, stampPageHeight]);

    const stampX = MARGIN;
    const stampY = MARGIN * 2;
    const stampW = width - MARGIN * 2;
    const textW = stampW - QR_SIZE - PADDING * 3;

    // Simple bordered container for the signature proof block.
    stampPage.drawRectangle({
      x: stampX,
      y: stampY,
      width: stampW,
      height: STAMP_H,
      color: rgb(1, 1, 1),
      borderColor: rgb(0.55, 0.55, 0.55),
      borderWidth: 0.6,
    });

    stampPage.drawText('Firmado electrónicamente por:', {
      x: stampX + PADDING,
      y: stampY + STAMP_H - 14,
      size: 9,
      font: boldFont,
      color: rgb(0.08, 0.08, 0.08),
    });

    const formattedDate = this.formatSignedAt(data.signedAt);

    const textLines = [
      `Nombre: ${data.signerName}`,
      `Número de Documento: ${data.signerDocumentNumber}`,
      `Email: ${data.signerEmail}`,
      `Fecha: ${formattedDate}`,
      `IP: ${data.ipAddress}`,
      `ID del documento: ${data.documentId}`,
      `Token: ${data.tokenHash}`,
    ];

    const LINE_H = 11;
    const textStartY = stampY + STAMP_H - 28;

    for (let i = 0; i < textLines.length; i++) {
      stampPage.drawText(textLines[i], {
        x: stampX + PADDING,
        y: textStartY - i * LINE_H,
        size: 7.5,
        font,
        color: rgb(0.1, 0.1, 0.15),
        maxWidth: textW,
      });
    }

    stampPage.drawText('Escanee el QR para verificar la validez de este documento.', {
      x: stampX + PADDING,
      y: stampY + 10,
      size: 7,
      font,
      color: rgb(0.32, 0.32, 0.32),
      maxWidth: textW,
    });

    // QR code aligned to the right, similar to the provided reference.
    const qrX = stampX + stampW - QR_SIZE - PADDING;
    const qrY = stampY + 10;
    stampPage.drawImage(qrImage, {
      x: qrX,
      y: qrY,
      width: QR_SIZE,
      height: QR_SIZE,
    });

    const modifiedBytes = await pdfDoc.save();
    await fs.promises.writeFile(fullPath, modifiedBytes);
  }

  private formatSignedAt(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    const offsetHours = -date.getTimezoneOffset() / 60;
    const sign = offsetHours >= 0 ? '+' : '-';
    const tz = `GMT${sign}${Math.abs(offsetHours)}`;

    return `${day}/${month}/${year} a las ${hours}:${minutes} - TZ: ${tz}`;
  }

  async stampConsolidatedPdf(pdfPath: string, data: ConsolidatedStampData): Promise<void> {
    const fullPath = this.resolveLocalPath(pdfPath);
    const pdfBytes = await fs.promises.readFile(fullPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Pre-generate all QR images before page layout
    const qrImages = [];
    for (const signer of data.signers) {
      const qrBuffer: Buffer = await QRCode.toBuffer(signer.verifyUrl, {
        errorCorrectionLevel: 'M',
        width: 150,
        margin: 1,
      });
      qrImages.push(await pdfDoc.embedPng(qrBuffer));
    }

    const pages = pdfDoc.getPages();
    const { width: docWidth } = pages[pages.length - 1].getSize();

    const MARGIN = 20;
    const PADDING = 8;
    const QR_SIZE = 62;
    const SIGNER_BLOCK_H = 75; // height consumed per signer (rect + gap below)
    const VALIDATOR_ROW_H = 12;
    const hasValidators = data.validators.length > 0;

    // Compute page height dynamically
    const pageHeight = MARGIN * 2
      + 46 // header section (title + separator + docId + date)
      + (hasValidators ? 20 + data.validators.length * VALIDATOR_ROW_H : 0)
      + 14 + data.signers.length * SIGNER_BLOCK_H // signers section
      + 21; // footer

    const stampPage = pdfDoc.addPage([docWidth, pageHeight]);

    stampPage.drawRectangle({
      x: 0, y: 0,
      width: docWidth, height: pageHeight,
      color: rgb(0.98, 0.98, 0.98),
    });

    const contentX = MARGIN;
    const contentW = docWidth - MARGIN * 2;
    const textW = contentW - QR_SIZE - PADDING * 3;

    // y = baseline cursor descending from top
    let y = pageHeight - MARGIN;

    // ── HEADER ──
    y -= 9;
    stampPage.drawText('FIRMADO ELECTRÓNICAMENTE', {
      x: contentX, y, size: 9, font: boldFont, color: rgb(0.08, 0.08, 0.08),
    });
    y -= 5;

    stampPage.drawLine({
      start: { x: contentX, y }, end: { x: contentX + contentW, y },
      thickness: 0.6, color: rgb(0.7, 0.7, 0.7),
    });
    y -= 7;

    stampPage.drawText(`ID del documento: ${data.documentId}`, {
      x: contentX, y, size: 7, font, color: rgb(0.35, 0.35, 0.35),
    });
    y -= 11;

    stampPage.drawText(`Completado el: ${this.formatSignedAt(data.completedAt)}`, {
      x: contentX, y, size: 7, font, color: rgb(0.35, 0.35, 0.35),
    });
    y -= 14;

    // ── VALIDATORS ──
    if (hasValidators) {
      stampPage.drawText('VALIDADORES', {
        x: contentX, y, size: 8, font: boldFont, color: rgb(0.2, 0.2, 0.2),
      });
      y -= 14;

      for (const v of data.validators) {
        stampPage.drawText(`✓  ${v.validatorName}  •  Aprobado: ${this.formatSignedAt(v.actionAt)}`, {
          x: contentX + PADDING, y, size: 7, font,
          color: rgb(0.1, 0.45, 0.15), maxWidth: contentW - PADDING,
        });
        y -= VALIDATOR_ROW_H;
      }
      y -= 6;
    }

    // ── SIGNERS ──
    stampPage.drawText('FIRMANTES', {
      x: contentX, y, size: 8, font: boldFont, color: rgb(0.2, 0.2, 0.2),
    });
    y -= 14;

    for (let i = 0; i < data.signers.length; i++) {
      const signer = data.signers[i];

      const rectBottom = y - (SIGNER_BLOCK_H - PADDING);
      stampPage.drawRectangle({
        x: contentX, y: rectBottom,
        width: contentW, height: SIGNER_BLOCK_H - PADDING,
        color: rgb(1, 1, 1),
        borderColor: rgb(0.75, 0.75, 0.75),
        borderWidth: 0.5,
      });

      let ty = y - PADDING;

      ty -= 9;
      stampPage.drawText(signer.signerName, {
        x: contentX + PADDING, y: ty, size: 9, font: boldFont,
        color: rgb(0.08, 0.08, 0.08), maxWidth: textW,
      });
      ty -= 4;

      ty -= 7;
      stampPage.drawText(`Email: ${signer.signerEmail}`, {
        x: contentX + PADDING, y: ty, size: 7, font,
        color: rgb(0.2, 0.2, 0.2), maxWidth: textW,
      });
      ty -= 3;

      ty -= 7;
      stampPage.drawText(
        `Doc: ${signer.signerDocumentNumber}  •  Fecha: ${this.formatSignedAt(signer.signedAt)}  •  IP: ${signer.ipAddress}`,
        { x: contentX + PADDING, y: ty, size: 7, font, color: rgb(0.2, 0.2, 0.2), maxWidth: textW },
      );
      ty -= 3;

      ty -= 6.5;
      const shortToken = signer.tokenHash.length > 32
        ? `${signer.tokenHash.substring(0, 32)}...`
        : signer.tokenHash;
      stampPage.drawText(`Token: ${shortToken}`, {
        x: contentX + PADDING, y: ty, size: 6.5, font,
        color: rgb(0.45, 0.45, 0.45), maxWidth: textW,
      });

      // QR code on the right, vertically centered in the block
      const qrX = contentX + contentW - QR_SIZE - PADDING;
      const qrY = rectBottom + ((SIGNER_BLOCK_H - PADDING - QR_SIZE) / 2);
      stampPage.drawImage(qrImages[i], { x: qrX, y: qrY, width: QR_SIZE, height: QR_SIZE });

      y -= SIGNER_BLOCK_H;
    }

    // ── FOOTER ──
    y -= 5;
    stampPage.drawLine({
      start: { x: contentX, y }, end: { x: contentX + contentW, y },
      thickness: 0.4, color: rgb(0.8, 0.8, 0.8),
    });
    y -= 8;

    stampPage.drawText('Escanee el código QR de cada firmante para verificar su firma digital.', {
      x: contentX, y, size: 6.5, font, color: rgb(0.45, 0.45, 0.45), maxWidth: contentW,
    });

    const modifiedBytes = await pdfDoc.save();
    await fs.promises.writeFile(fullPath, modifiedBytes);
  }

  private resolveLocalPath(filePath: string): string {
    if (path.isAbsolute(filePath)) return filePath;
    const uploadDir = process.env.FILE_STORAGE_LOCAL_PATH ?? './uploads';
    const normalized = path.normalize(filePath);
    const normalizedDir = path.normalize(uploadDir);
    if (normalized.startsWith(normalizedDir + path.sep)) return normalized;
    return path.join(uploadDir, filePath);
  }
}
