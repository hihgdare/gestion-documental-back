import { Repository, IsNull } from 'typeorm';
import { AppDataSource } from '@shared/infrastructure/database/typeorm.config';
import { FileEntity } from '@shared/infrastructure/database/entities/file.entity';
import { File } from '@domains/file/entities/file.entity';

export class TypeOrmFileRepository {
  private repository: Repository<FileEntity>;

  constructor() {
    this.repository = AppDataSource.getRepository(FileEntity);
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

  async softDelete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }
}

