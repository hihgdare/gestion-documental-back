import { Repository } from 'typeorm';
import { DocumentHistoryRepository } from '@domains/document/repositories/document-history.repository';
import { DocumentHistory, DocumentHistoryProps } from '@domains/document/entities/document-history.entity';
import { DocumentAction } from '@domains/document/value-objects/document-enums';
import { DocumentHistoryEntity } from '../database/entities/document-history.entity';
import { AppDataSource } from '../database/typeorm.config';
import { DateUtils } from '@shared/utils/date';

export class TypeOrmDocumentHistoryRepository implements DocumentHistoryRepository {
  private repository: Repository<DocumentHistoryEntity>;

  constructor() {
    this.repository = AppDataSource.getRepository(DocumentHistoryEntity);
  }

  async findById(id: string): Promise<DocumentHistory | null> {
    const entity = await this.repository.findOne({ where: { id } });
    if (!entity) return null;
    return this.toDomain(entity);
  }

  async findAll(): Promise<DocumentHistory[]> {
    const entities = await this.repository.find({
      relations: ['updater'],
      order: { updatedAt: 'DESC' },
    });
    return entities.map(entity => this.toDomain(entity));
  }

  async findByDocumentId(documentId: string): Promise<DocumentHistory[]> {
    const entities = await this.repository.find({
      where: { documentId },
      relations: ['updater'],
      order: { updatedAt: 'DESC' },
    });
    return entities.map(entity => this.toDomain(entity));
  }

  async findByAction(action: DocumentAction): Promise<DocumentHistory[]> {
    const entities = await this.repository.find({
      where: { action },
      order: { updatedAt: 'DESC' },
    });
    return entities.map(entity => this.toDomain(entity));
  }

  async findByUpdatedBy(updatedBy: string): Promise<DocumentHistory[]> {
    const entities = await this.repository.find({
      where: { updatedBy },
      order: { updatedAt: 'DESC' },
    });
    return entities.map(entity => this.toDomain(entity));
  }

  async findByDocumentIdAndAction(documentId: string, action: DocumentAction): Promise<DocumentHistory[]> {
    const entities = await this.repository.find({
      where: { documentId, action },
      order: { updatedAt: 'DESC' },
    });
    return entities.map(entity => this.toDomain(entity));
  }

  async save(props: DocumentHistoryProps): Promise<DocumentHistory> {
    const domain = new DocumentHistory(props);
    const entity = this.toEntity(domain);
    const savedEntity = await this.repository.save(entity);
    return this.toDomain(savedEntity);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  private toDomain(entity: DocumentHistoryEntity): DocumentHistory {
    return new DocumentHistory({
      id: entity.id,
      documentId: entity.documentId,
      documentTypeId: entity.documentTypeId,
      documentSubtypeId: entity.documentSubtypeId,
      name: entity.name,
      issuedDate: DateUtils.parse(entity.issuedDate)!,
      expirationDate: DateUtils.parse(entity.expirationDate),
      contractId: entity.contractId,
      description: entity.description,
      documentUrl: entity.documentUrl,
      status: entity.status,
      comment: entity.comment,
      action: entity.action,
      updatedBy: entity.updatedBy,
      updatedByName: entity.updater?.firstName,
      updatedByLastName: entity.updater?.lastName,
      updatedAt: entity.updatedAt,
    });
  }

  private toEntity(history: DocumentHistory): Partial<DocumentHistoryEntity> {
    return {
      id: history.id,
      documentId: history.documentId,
      documentTypeId: history.documentTypeId,
      documentSubtypeId: history.documentSubtypeId,
      name: history.name,
      issuedDate: DateUtils.toLocalDate(history.issuedDate)!,
      expirationDate: history.expirationDate ? DateUtils.toLocalDate(history.expirationDate) : undefined,
      contractId: history.contractId || undefined,
      description: history.description,
      documentUrl: history.documentUrl,
      status: history.status,
      comment: history.comment || undefined,
      action: history.action,
      updatedBy: history.updatedBy,
      updatedAt: history.updatedAt,
    };
  }
}
