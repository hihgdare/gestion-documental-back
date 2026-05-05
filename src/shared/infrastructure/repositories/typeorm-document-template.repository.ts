import { IsNull, Repository } from 'typeorm';
import { IDocumentTemplateRepository } from '@domains/document-template/repositories/document-template.repository.interface';
import { DocumentTemplate, DocumentTemplateField } from '@domains/document-template/entities/document-template.entity';
import { DocumentTemplateEntity } from '../database/entities/document-template.entity';
import { AppDataSource } from '../database/typeorm.config';
import { NotFoundError } from '@shared/domain/errors';

export class TypeOrmDocumentTemplateRepository implements IDocumentTemplateRepository {
  private repository: Repository<DocumentTemplateEntity>;

  constructor() {
    this.repository = AppDataSource.getRepository(DocumentTemplateEntity);
  }

  async save(template: DocumentTemplate): Promise<DocumentTemplate> {
    const entity = this.toEntity(template);
    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  async findById(id: string): Promise<DocumentTemplate | null> {
    const entity = await this.repository.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!entity) return null;
    return this.toDomain(entity);
  }

  async findAll(groupId?: number): Promise<DocumentTemplate[]> {
    const where: Record<string, unknown> = { deletedAt: IsNull() };
    if (groupId) where.groupId = groupId;

    const entities = await this.repository.find({
      where,
      order: { code: 'ASC', version: 'DESC' },
    });
    return entities.map(e => this.toDomain(e));
  }

  async findByCode(code: string): Promise<DocumentTemplate[]> {
    const entities = await this.repository.find({
      where: { code, deletedAt: IsNull() },
      order: { version: 'DESC' },
    });
    return entities.map(e => this.toDomain(e));
  }

  async findLatestByCode(code: string, groupId: number): Promise<DocumentTemplate | null> {
    const entity = await this.repository.findOne({
      where: { code, groupId, deletedAt: IsNull() },
      order: { version: 'DESC' },
    });
    if (!entity) return null;
    return this.toDomain(entity);
  }

  async delete(id: string): Promise<void> {
    const entity = await this.repository.findOne({ where: { id } });
    if (!entity) throw new NotFoundError('Plantilla de documento no encontrada');
    await this.repository.softDelete(id);
  }

  async getNextCode(): Promise<string> {
    const result = await this.repository
      .createQueryBuilder('dt')
      .select('MAX(dt.code)', 'maxCode')
      .getRawOne<{ maxCode: string | null }>();

    const maxCode = result?.maxCode;
    let nextNum = 1;

    if (maxCode) {
      const match = maxCode.match(/^DOC-(\d+)$/);
      if (match) {
        nextNum = parseInt(match[1], 10) + 1;
      }
    }

    return `DOC-${String(nextNum).padStart(5, '0')}`;
  }

  private toEntity(domain: DocumentTemplate): DocumentTemplateEntity {
    const entity = new DocumentTemplateEntity();
    entity.id = domain.id;
    entity.code = domain.code;
    entity.title = domain.title;
    entity.version = domain.version;
    entity.documentDate = domain.documentDate;
    entity.description = domain.description ?? undefined;
    entity.fileUrl = domain.fileUrl ?? undefined;
    entity.groupId = domain.groupId;
    entity.fieldsJson = domain.fields.length > 0 ? JSON.stringify(domain.fields) : undefined;
    entity.createdBy = domain.createdBy ?? undefined;
    return entity;
  }

  private toDomain(entity: DocumentTemplateEntity): DocumentTemplate {
    let fields: DocumentTemplateField[] = [];
    if (entity.fieldsJson) {
      try {
        fields = JSON.parse(entity.fieldsJson) as DocumentTemplateField[];
      } catch {
        fields = [];
      }
    }

    return DocumentTemplate.create({
      id: entity.id,
      code: entity.code,
      title: entity.title,
      version: entity.version,
      documentDate: entity.documentDate,
      description: entity.description,
      fileUrl: entity.fileUrl,
      groupId: entity.groupId,
      fields,
      createdBy: entity.createdBy,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt ?? null,
    });
  }
}
