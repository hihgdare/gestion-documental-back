import { Repository } from 'typeorm';
import { DocumentTemplate } from '@domains/document-template/entities/document-template.entity';
import { DocumentTemplateEntity } from '../database/entities/document-template.entity';
import { AppDataSource } from '../database/typeorm.config';

import type { DocumentTemplateRepository } from '@domains/document-template/repositories/document-template.repository';

export class TypeOrmDocumentTemplateRepository implements DocumentTemplateRepository {
  private repository: Repository<DocumentTemplateEntity>;

  constructor() {
    this.repository = AppDataSource.getRepository(DocumentTemplateEntity);
  }

  async findById(id: string): Promise<DocumentTemplate | null> {
    const entity = await this.repository.findOne({ where: { id } });
    if (!entity) return null;
    return this.toDomain(entity);
  }

  async findAll(): Promise<DocumentTemplate[]> {
    const entities = await this.repository.find({ order: { name: 'ASC' } });
    return entities.map(e => this.toDomain(e));
  }

  async save(template: DocumentTemplate): Promise<DocumentTemplate> {
    const entity = this.toEntity(template);
    const saved = await this.repository.save(entity as any);
    return this.toDomain(saved);
  }

  async update(template: DocumentTemplate): Promise<DocumentTemplate> {
    const entity = this.toEntity(template);
    await this.repository.update(template.id, entity as any);
    const updated = await this.repository.findOne({ where: { id: template.id } });
    return this.toDomain(updated!);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async findByName(name: string): Promise<DocumentTemplate | null> {
    const entity = await this.repository.findOne({ where: { name } });
    if (!entity) return null;
    return this.toDomain(entity);
  }

  async existsByName(name: string): Promise<boolean> {
    const count = await this.repository.count({ where: { name } });
    return count > 0;
  }

  private toDomain(entity: DocumentTemplateEntity): DocumentTemplate {
    return DocumentTemplate.create({
      id: entity.id,
      name: entity.name,
      description: entity.description,
      documentTypeId: entity.documentTypeId,
      documentSubtypeId: entity.documentSubtypeId,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  private toEntity(domain: DocumentTemplate): Partial<DocumentTemplateEntity> {
    return {
      id: domain.id,
      name: domain.name,
      description: domain.description ?? null,
      documentTypeId: domain.documentTypeId,
      documentSubtypeId: domain.documentSubtypeId,
      createdAt: domain.createdAt,
      updatedAt: domain.updatedAt,
    };
  }
}
