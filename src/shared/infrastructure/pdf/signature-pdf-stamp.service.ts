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
}

export interface ConsolidatedStampData {
  documentId: string;
  completedAt: Date;
  verifyUrl: string;
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

    // Single QR for the whole document
    const qrBuffer: Buffer = await QRCode.toBuffer(data.verifyUrl || 'N/A', {
      errorCorrectionLevel: 'M',
      width: 200,
      margin: 1,
    });
    const qrImage = await pdfDoc.embedPng(qrBuffer);

    const pages = pdfDoc.getPages();
    const { width: docWidth } = pages[pages.length - 1].getSize();

    const MARGIN = 20;
    const PADDING = 8;
    const QR_SIZE = 70;
    const HEADER_H = QR_SIZE + 20; // tall enough to fit the QR with vertical padding
    const SIGNER_ROW_H = 60; // per signer (rect + gap below), no QR needed

    const pageHeight = MARGIN * 2
      + HEADER_H
      + 14 + data.signers.length * SIGNER_ROW_H
      + 21; // footer

    const stampPage = pdfDoc.addPage([docWidth, pageHeight]);

    stampPage.drawRectangle({
      x: 0, y: 0,
      width: docWidth, height: pageHeight,
      color: rgb(0.98, 0.98, 0.98),
    });

    const contentX = MARGIN;
    const contentW = docWidth - MARGIN * 2;
    // Header text stays left of the QR
    const headerTextW = contentW - QR_SIZE - PADDING * 2;

    // ── QR: top-right corner, drawn independently ──
    const qrX = contentX + contentW - QR_SIZE;
    const qrY = pageHeight - MARGIN - QR_SIZE;
    stampPage.drawImage(qrImage, { x: qrX, y: qrY, width: QR_SIZE, height: QR_SIZE });

    // y cursor descends from top
    let y = pageHeight - MARGIN;

    // ── HEADER ──
    y -= 9;
    stampPage.drawText('FIRMADO ELECTRÓNICAMENTE', {
      x: contentX, y, size: 9, font: boldFont, color: rgb(0.08, 0.08, 0.08),
    });
    y -= 5;

    stampPage.drawLine({
      start: { x: contentX, y }, end: { x: contentX + headerTextW, y },
      thickness: 0.6, color: rgb(0.7, 0.7, 0.7),
    });
    y -= 7;

    stampPage.drawText(`ID del documento: ${data.documentId}`, {
      x: contentX, y, size: 7, font, color: rgb(0.35, 0.35, 0.35), maxWidth: headerTextW,
    });
    y -= 11;

    stampPage.drawText(`Completado el: ${this.formatSignedAt(data.completedAt)}`, {
      x: contentX, y, size: 7, font, color: rgb(0.35, 0.35, 0.35), maxWidth: headerTextW,
    });
    y -= 11;

    stampPage.drawText('Escanee el QR para verificar la autenticidad de este documento.', {
      x: contentX, y, size: 6.5, font, color: rgb(0.45, 0.45, 0.45), maxWidth: headerTextW,
    });

    // Advance y past the full header section (including QR height)
    y = pageHeight - MARGIN - HEADER_H;

    // ── SIGNERS (compact rows, no individual QR) ──
    stampPage.drawText('FIRMANTES', {
      x: contentX, y, size: 8, font: boldFont, color: rgb(0.2, 0.2, 0.2),
    });
    y -= 14;

    for (const signer of data.signers) {
      const rectBottom = y - (SIGNER_ROW_H - PADDING);
      stampPage.drawRectangle({
        x: contentX, y: rectBottom,
        width: contentW, height: SIGNER_ROW_H - PADDING,
        color: rgb(1, 1, 1),
        borderColor: rgb(0.75, 0.75, 0.75),
        borderWidth: 0.5,
      });

      let ty = y - PADDING;

      ty -= 9;
      stampPage.drawText(signer.signerName, {
        x: contentX + PADDING, y: ty, size: 9, font: boldFont,
        color: rgb(0.08, 0.08, 0.08), maxWidth: contentW - PADDING * 2,
      });

      ty -= 11;
      stampPage.drawText(`${signer.signerEmail}  |  Doc: ${signer.signerDocumentNumber}`, {
        x: contentX + PADDING, y: ty, size: 7, font,
        color: rgb(0.2, 0.2, 0.2), maxWidth: contentW - PADDING * 2,
      });

      ty -= 10;
      stampPage.drawText(
        `Fecha: ${this.formatSignedAt(signer.signedAt)}  |  IP: ${signer.ipAddress}`,
        { x: contentX + PADDING, y: ty, size: 7, font, color: rgb(0.2, 0.2, 0.2), maxWidth: contentW - PADDING * 2 },
      );

      ty -= 10;
      const shortToken = signer.tokenHash.length > 48
        ? `${signer.tokenHash.substring(0, 48)}...`
        : signer.tokenHash;
      stampPage.drawText(`Token: ${shortToken}`, {
        x: contentX + PADDING, y: ty, size: 6.5, font,
        color: rgb(0.45, 0.45, 0.45), maxWidth: contentW - PADDING * 2,
      });

      y -= SIGNER_ROW_H;
    }

    // ── FOOTER ──
    y -= 5;
    stampPage.drawLine({
      start: { x: contentX, y }, end: { x: contentX + contentW, y },
      thickness: 0.4, color: rgb(0.8, 0.8, 0.8),
    });
    y -= 8;

    stampPage.drawText(`Verificar en: ${data.verifyUrl}`, {
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
