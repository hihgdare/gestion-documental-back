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
    const lastPage = pages[pages.length - 1];
    const { width } = lastPage.getSize();

    const MARGIN = 20;
    const STAMP_H = 174;
    const PADDING = 8;
    const QR_SIZE = 78;

    const stampX = MARGIN;
    const stampY = MARGIN;
    const stampW = width - MARGIN * 2;
    const textW = stampW - QR_SIZE - PADDING * 3;

    // Simple bordered container for the signature proof block.
    lastPage.drawRectangle({
      x: stampX,
      y: stampY,
      width: stampW,
      height: STAMP_H,
      color: rgb(1, 1, 1),
      borderColor: rgb(0.55, 0.55, 0.55),
      borderWidth: 0.6,
    });

    lastPage.drawText('Firmado electrónicamente por:', {
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
      lastPage.drawText(textLines[i], {
        x: stampX + PADDING,
        y: textStartY - i * LINE_H,
        size: 7.5,
        font,
        color: rgb(0.1, 0.1, 0.15),
        maxWidth: textW,
      });
    }

    lastPage.drawText('Escanee el QR para verificar la validez de este documento.', {
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
    lastPage.drawImage(qrImage, {
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

  private resolveLocalPath(filePath: string): string {
    if (path.isAbsolute(filePath)) return filePath;
    const uploadDir = process.env.FILE_STORAGE_LOCAL_PATH ?? './uploads';
    const normalized = path.normalize(filePath);
    const normalizedDir = path.normalize(uploadDir);
    if (normalized.startsWith(normalizedDir + path.sep)) return normalized;
    return path.join(uploadDir, filePath);
  }
}
