import { Repository } from 'typeorm';
import { AppDataSource } from '@shared/infrastructure/database/typeorm.config';
import { UploadEntity } from '@shared/infrastructure/database/entities/upload.entity';
import { Upload } from '@domains/upload/entities/upload.entity';

export class TypeOrmUploadRepository {
  private repository: Repository<UploadEntity>;

  constructor() {
    this.repository = AppDataSource.getRepository(UploadEntity);
  }

  async save(file: Upload): Promise<Upload> {
    const entity = UploadEntity.fromDomain(file);
    const saved = await this.repository.save(entity);
    return UploadEntity.toDomain(saved);
  }
}

