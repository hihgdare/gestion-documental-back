import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Upload } from '@domains/upload/entities/upload.entity';

@Entity('uploads')
export class UploadEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'original_name', type: 'varchar', length: 255 })
  originalName!: string;

  @Column({ type: 'varchar', length: 1024 })
  path!: string;

  @Column({ type: 'varchar', length: 32 })
  storage!: 'local' | 's3';

  @Column({ name: 'mime_type', type: 'varchar', length: 128, nullable: true })
  mimeType?: string;

  @Column({ type: 'int', nullable: true })
  size?: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  static fromDomain(file: Upload): UploadEntity {
    const entity = new UploadEntity();
    entity.id = file.id as any;
    entity.originalName = file.originalName;
    entity.path = file.path;
    entity.storage = file.storage;
    entity.mimeType = file.mimeType;
    entity.size = file.size as any;
    return entity;
  }

  static toDomain(entity: UploadEntity): Upload {
    return new Upload({
      id: entity.id,
      originalName: entity.originalName,
      path: entity.path,
      storage: entity.storage,
      mimeType: entity.mimeType,
      size: entity.size ?? undefined,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}

