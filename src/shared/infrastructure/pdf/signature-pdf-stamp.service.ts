import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import QRCode from 'qrcode';
import path from 'path';
import fs from 'fs';

export interface SignatureStampData {
  signerName: string;
  signerEmail: string;
  signedAt: Date;
  ipAddress: string;
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
    const STAMP_H = 100;
    const PADDING = 8;
    const QR_SIZE = 80;
    const HEADER_H = 16;

    const stampX = MARGIN;
    const stampY = MARGIN;
    const stampW = width - MARGIN * 2;
    const textW = stampW - QR_SIZE - PADDING * 3;

    // Background
    lastPage.drawRectangle({
      x: stampX,
      y: stampY,
      width: stampW,
      height: STAMP_H,
      color: rgb(0.97, 0.97, 0.99),
      borderColor: rgb(0.2, 0.3, 0.75),
      borderWidth: 0.75,
    });

    // Header bar
    lastPage.drawRectangle({
      x: stampX,
      y: stampY + STAMP_H - HEADER_H,
      width: stampW,
      height: HEADER_H,
      color: rgb(0.2, 0.3, 0.75),
    });

    lastPage.drawText('FIRMA ELECTRONICA SIMPLE', {
      x: stampX + PADDING,
      y: stampY + STAMP_H - HEADER_H + 4,
      size: 7.5,
      font: boldFont,
      color: rgb(1, 1, 1),
    });

    const formattedDate = data.signedAt.toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
    const tokenPreview = data.tokenHash.slice(0, 24) + '...';

    const textLines = [
      `Firmante: ${data.signerName}`,
      `Email: ${data.signerEmail}`,
      `Fecha: ${formattedDate}`,
      `IP: ${data.ipAddress}`,
      `Token: ${tokenPreview}`,
    ];

    const LINE_H = 13;
    const textStartY = stampY + STAMP_H - HEADER_H - 10;

    for (let i = 0; i < textLines.length; i++) {
      lastPage.drawText(textLines[i], {
        x: stampX + PADDING,
        y: textStartY - i * LINE_H,
        size: 7,
        font,
        color: rgb(0.1, 0.1, 0.15),
        maxWidth: textW,
      });
    }

    // QR code (centered vertically in text area)
    const qrX = stampX + stampW - QR_SIZE - PADDING;
    const qrY = stampY + (STAMP_H - HEADER_H - QR_SIZE) / 2 + 3;
    lastPage.drawImage(qrImage, {
      x: qrX,
      y: qrY,
      width: QR_SIZE,
      height: QR_SIZE,
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
