import fs from 'fs';
import { Repository, IsNull } from 'typeorm';
import { AppDataSource } from '@shared/infrastructure/database/typeorm.config';
import { FileEntity } from '@shared/infrastructure/database/entities/file.entity';
import { File } from '@domains/file/entities/file.entity';
import { Bucket } from '@shared/utils/Bucket';
import { ServerError } from '@shared/domain/errors';

export class TypeOrmFileRepository {
  private repository: Repository<FileEntity>;

  constructor() {
    this.repository = AppDataSource.getRepository(FileEntity);
  }

  /** Lee el contenido binario de un archivo, sea cual sea su storage (local o S3). */
  async getContent(file: File): Promise<Buffer> {
    if (file.storage === 's3') {
      const bucketName = process.env.AWS_S3_BUCKET;
      const region = process.env.AWS_DEFAULT_REGION;
      const accessKeyId = process.env.AWS_S3_ACCESS_KEY_ID;
      const secretAccessKey = process.env.AWS_S3_SECRET_ACCESS_KEY;

      if (!bucketName || !region || !accessKeyId || !secretAccessKey) {
        throw new ServerError('S3 configuration incomplete');
      }

      const bucket = new Bucket({
        bucket: bucketName,
        region,
        credentials: { accessKeyId, secretAccessKey },
      });

      return bucket.downloadFile({ source: file.path });
    }

    return fs.promises.readFile(file.path);
  }

  async save(file: File): Promise<File> {
    const entity = FileEntity.fromDomain(file);
    const saved = await this.repository.save(entity);
    return FileEntity.toDomain(saved);
  }

  async findById(id: string): Promise<File | null> {
    const entity = await this.repository.findOne({ where: { id, deletedAt: IsNull() } });
    if (!entity) return null;
    return FileEntity.toDomain(entity);
  }

  async findByIdIncludingDeleted(id: string): Promise<File | null> {
    const entity = await this.repository.findOne({ where: { id }, withDeleted: true });
    if (!entity) return null;
    return FileEntity.toDomain(entity);
  }

  async softDelete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }
}

