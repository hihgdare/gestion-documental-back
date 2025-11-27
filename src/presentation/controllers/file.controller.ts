import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { Bucket } from '@shared/utils/Bucket';
import FileUtils from '@shared/utils/FileUtils';
import { TypeOrmFileRepository } from '@shared/infrastructure/repositories/typeorm-file.repository';
import { File } from '@domains/file/entities/file.entity';

const STORAGE = (process.env.FILE_STORAGE || 'local').toLowerCase();

export class FileController {
  constructor(private readonly fileRepo: TypeOrmFileRepository) {
    this.upload = this.upload.bind(this);
    this.download = this.download.bind(this);
    this.getFileById = this.getFileById.bind(this);
  }

  async upload(req: Request, res: Response): Promise<void> {
    const { filename, contentBase64, mimeType, size } = req.body as {
      filename: string;
      contentBase64: string;
      mimeType?: string;
      size?: number;
    };

    if (!filename || !contentBase64) {
      res.status(400).json({ success: false, message: 'filename y contentBase64 son requeridos' });
      return;
    }

    // Save file locally using FileUtils utility
    const result = await FileUtils.save(contentBase64, filename);
    const { path: localPath, filename: uniqueName, size: fileSize } = result;

    let filePath = localPath;
    let storage: 'local' | 's3' = 'local';

    // Upload to S3 if configured
    if (STORAGE === 's3') {
      const bucketName = process.env.FILE_STORAGE_S3_BUCKET;
      const region = process.env.AWS_REGION;
      const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
      const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

      if (!bucketName || !region || !accessKeyId || !secretAccessKey) {
        res.status(500).json({ success: false, message: 'S3 configuration incomplete' });
        return;
      }

      const bucket = new Bucket({
        bucket: bucketName,
        region,
        credentials: { accessKeyId, secretAccessKey },
      });

      try {
        const s3Key = `${FileUtils.getDateFolder()}/${uniqueName}`;
        await bucket.uploadFile({ source: localPath, target: s3Key });
        storage = 's3';
        filePath = s3Key;

        // Delete local file after successful S3 upload
        await FileUtils.delete(localPath);
      } catch (error) {
        console.error('Error uploading to S3:', error);
        throw error;
      }
    }

    const file = new File({
      originalName: path.basename(filename),
      path: filePath,
      storage,
      mimeType,
      size: size || fileSize,
    });

    const savedFile = await this.fileRepo.save(file);

    res.status(201).json({ success: true, data: savedFile });
  }

  async getFileById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ success: false, message: 'File ID is required' });
      return;
    }

    const file = await this.fileRepo.findById(id);

    if (!file) {
      res.status(404).json({ success: false, message: 'File not found' });
      return;
    }

    res.status(200).json({ success: true, data: file });
  }

  async download(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ success: false, message: 'File ID is required' });
      return;
    }

    const file = await this.fileRepo.findById(id);

    if (!file) {
      res.status(404).json({ success: false, message: 'File not found' });
      return;
    }

    try {
      if (file.storage === 's3') {
        // Download from S3
        const bucketName = process.env.FILE_STORAGE_S3_BUCKET;
        const region = process.env.AWS_REGION;
        const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
        const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

        if (!bucketName || !region || !accessKeyId || !secretAccessKey) {
          res.status(500).json({ success: false, message: 'S3 configuration incomplete' });
          return;
        }

        const bucket = new Bucket({
          bucket: bucketName,
          region,
          credentials: { accessKeyId, secretAccessKey },
        });

        // Generate a temporary local path
        const tempDir = FileUtils.buildPath('temp');
        await fs.promises.mkdir(tempDir, { recursive: true });
        const tempPath = path.join(tempDir, file.id);

        // Download from S3 to temp location
        const s3Buffer = await bucket.downloadFile({ source: file.path });
        await fs.promises.writeFile(tempPath, s3Buffer);

        // Send file
        res.setHeader('Content-Type', file.mimeType || 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.originalName)}"`);

        const fileStream = fs.createReadStream(tempPath);
        fileStream.pipe(res);

        // Delete temp file after sending
        fileStream.on('end', async () => {
          try {
            await FileUtils.delete(tempPath);
          } catch (error) {
            console.error('Error deleting temp file:', error);
          }
        });
      } else {
        // Download from local storage
        if (!fs.existsSync(file.path)) {
          res.status(404).json({ success: false, message: 'File not found on disk' });
          return;
        }

        res.setHeader('Content-Type', file.mimeType || 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.originalName)}"`);

        const fileStream = fs.createReadStream(file.path);
        fileStream.pipe(res);
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      res.status(500).json({ success: false, message: 'Error downloading file' });
    }
  }
}
