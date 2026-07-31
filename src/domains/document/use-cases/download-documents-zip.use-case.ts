import path from 'path';
import fs from 'fs';
import archiver, { type Archiver } from 'archiver';
import { type DocumentRepository } from '../repositories/document.repository';
import { type TypeOrmFileRepository } from '@shared/infrastructure/repositories/typeorm-file.repository';
import { Bucket } from '@shared/utils/Bucket';
import { ValidationError } from '@shared/domain/errors';

function sanitizeForZipPath(name: string): string {
  return name.replace(/[/\\:*?"<>|]/g, '_').trim() || 'Sin nombre';
}

function uniqueEntryName(entryDir: string, baseName: string, extension: string, usedNames: Map<string, number>): string {
  const key = `${entryDir}/${baseName}${extension}`;
  const count = usedNames.get(key) ?? 0;
  usedNames.set(key, count + 1);
  if (count === 0) return `${entryDir}/${baseName}${extension}`;
  return `${entryDir}/${baseName} (${count})${extension}`;
}

export class DownloadDocumentsZipUseCase {
  constructor(
    private readonly documentRepository: DocumentRepository,
    private readonly fileRepository: TypeOrmFileRepository,
  ) {}

  execute(documentIds: string[]): Archiver {
    if (!documentIds || documentIds.length === 0) {
      throw new ValidationError('Debe proporcionar al menos un documento', 'documentIds');
    }

    const archive: Archiver = archiver('zip', { zlib: { level: 9 } });

    this.buildArchive(archive, documentIds).catch((error) => {
      console.error('Error building documents zip:', error);
      archive.emit('error', error instanceof Error ? error : new Error('Error building zip'));
    });

    return archive;
  }

  private async buildArchive(archive: Archiver, documentIds: string[]): Promise<void> {
    const documents = await this.documentRepository.findByIds(documentIds);
    const usedNames = new Map<string, number>();

    for (const document of documents) {
      if (!document.documentUrl) continue;

      try {
        const file = await this.fileRepository.findById(document.documentUrl);
        if (!file) continue;

        const buffer = await this.readFileBuffer(file.path, file.storage);

        const entryDir = [
          sanitizeForZipPath(document.familyName || 'Sin familia'),
          sanitizeForZipPath(document.documentTypeName || 'Sin tipo'),
          sanitizeForZipPath(document.documentSubtypeName || 'Sin subtipo'),
        ].join('/');
        const extension = path.extname(file.originalName);
        const baseName = sanitizeForZipPath(document.name);
        const entryName = uniqueEntryName(entryDir, baseName, extension, usedNames);

        archive.append(buffer, { name: entryName });
      } catch (error) {
        console.error(`Error adding document ${document.id} to zip:`, error);
      }
    }

    await archive.finalize();
  }

  private async readFileBuffer(filePath: string, storage: string): Promise<Buffer> {
    if (storage === 's3') {
      const bucketName = process.env.AWS_S3_BUCKET;
      const region = process.env.AWS_DEFAULT_REGION;
      const accessKeyId = process.env.AWS_S3_ACCESS_KEY_ID;
      const secretAccessKey = process.env.AWS_S3_SECRET_ACCESS_KEY;

      if (!bucketName || !region || !accessKeyId || !secretAccessKey) {
        throw new Error('S3 configuration incomplete');
      }

      const bucket = new Bucket({
        bucket: bucketName,
        region,
        credentials: { accessKeyId, secretAccessKey },
      });

      return bucket.downloadFile({ source: filePath });
    }

    return fs.promises.readFile(filePath);
  }
}
