import { Repository, LessThanOrEqual, Not } from 'typeorm';
import { type DocumentRepository } from '@domains/document/repositories/document.repository';
import { Document, type DocumentProps } from '@domains/document/entities/document.entity';
import { DocumentEntity } from '../database/entities/document.entity';
import { AppDataSource } from '../database/typeorm.config';
import { DateUtils } from '@shared/utils/date';

export class TypeOrmDocumentRepository implements DocumentRepository {
  private repository: Repository<DocumentEntity>;

  constructor() {
    this.repository = AppDataSource.getRepository(DocumentEntity);
  }

  async findById(id: string): Promise<Document | null> {
    const documentEntity = await this.repository.findOne({
      where: { id },
      relations: ['contract', 'template', 'template.documentType', 'template.documentSubtype', 'colaborator'],
    });
    if (!documentEntity) return null;
    return this.toDomain(documentEntity);
  }

  async findAll(): Promise<Document[]> {
    const documentEntities = await this.repository.find({
      relations: ['contract', 'template', 'template.documentType', 'template.documentSubtype', 'colaborator'],
      order: { createdAt: 'DESC' },
    });
    return documentEntities.map(entity => this.toDomain(entity));
  }

  async save(document: Document): Promise<Document> {
    const documentEntity = this.toEntity(document);
    const savedEntity = await this.repository.save(documentEntity);
    return this.toDomain(savedEntity);
  }

  async update(document: Document): Promise<Document> {
    const documentEntity = this.toEntity(document);
    await this.repository.update(document.id, documentEntity);
    const updatedEntity = await this.repository.findOne({ where: { id: document.id } });
    return this.toDomain(updatedEntity!);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async findByContractId(contractId: string): Promise<Document[]> {
    const documentEntities = await this.repository.find({
      where: { contractId },
      relations: ['contract', 'template', 'template.documentType', 'template.documentSubtype', 'colaborator'],
      order: { createdAt: 'DESC' },
    });
    return documentEntities.map(entity => this.toDomain(entity));
  }

  async findByTemplateId(templateId: string): Promise<Document[]> {
    const documentEntities = await this.repository.find({
      where: { templateId },
      relations: ['contract', 'template', 'template.documentType', 'template.documentSubtype', 'colaborator'],
      order: { createdAt: 'DESC' },
    });
    return documentEntities.map(entity => this.toDomain(entity));
  }

  async findByColaboratorId(colaboratorId: string): Promise<Document[]> {
    const documentEntities = await this.repository.find({
      where: { colaboratorId },
      relations: ['contract', 'template', 'template.documentType', 'template.documentSubtype', 'colaborator'],
      order: { createdAt: 'DESC' },
    });
    return documentEntities.map(entity => this.toDomain(entity));
  }

  async findExpiredDocuments(): Promise<Document[]> {
    const documentEntities = await this.repository.find({
      where: {
        expirationDate: LessThanOrEqual(new Date()),
      },
      relations: ['contract', 'template', 'colaborator'],
      order: { expirationDate: 'ASC' },
    });
    return documentEntities.map(entity => this.toDomain(entity));
  }

  async findExpiringDocuments(days: number): Promise<Document[]> {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);

    const documentEntities = await this.repository
      .createQueryBuilder('document')
      .leftJoinAndSelect('document.contract', 'contract')
      .leftJoinAndSelect('document.template', 'template')
      .leftJoinAndSelect('template.documentType', 'documentType')
      .leftJoinAndSelect('template.documentSubtype', 'documentSubtype')
      .leftJoinAndSelect('document.colaborator', 'colaborator')
      .where('document.expiration_date IS NOT NULL')
      .andWhere('document.expiration_date > :today', { today })
      .andWhere('document.expiration_date <= :futureDate', { futureDate })
      .orderBy('document.expiration_date', 'ASC')
      .getMany();

    return documentEntities.map(entity => this.toDomain(entity));
  }

  async existsByTemplateAndColaborator(templateId: string, colaboratorId: string, excludeId?: string): Promise<boolean> {
    const where: any = { templateId, colaboratorId, deletedAt: null };
    if (excludeId) where.id = Not(excludeId);

    const existing = await this.repository.findOne({ where });
    return !!existing;
  }

  private toDomain(entity: DocumentEntity): Document {
    const props: DocumentProps = {
      id: entity.id,
      templateId: entity.templateId,
      colaboratorId: entity.colaboratorId,
      templateName: entity.template?.name,
      documentTypeName: entity.template?.documentType?.name,
      documentSubtypeName: entity.template?.documentSubtype?.name,
      name: entity.name,
      issuedDate: entity.issuedDate,
      expirationDate: entity.expirationDate,
      contractId: entity.contractId,
      contractNumber: entity.contract?.contractNumber,
      contractProjectName: entity.contract?.nombreProyecto,
      description: entity.description,
      documentUrl: entity.documentUrl,
      status: entity.status,
      comment: entity.comment,
      createdBy: entity.createdBy,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
    return Document.create(props);
  }

  private toEntity(document: Document): Partial<DocumentEntity> {
    return {
      id: document.id,
      templateId: document.templateId,
      colaboratorId: document.colaboratorId,
      name: document.name,
      issuedDate: DateUtils.toLocalDate(document.issuedDate)!,
      expirationDate: document.expirationDate ? DateUtils.toLocalDate(document.expirationDate) : undefined,
      contractId: document.contractId || undefined,
      description: document.description,
      documentUrl: document.documentUrl,
      status: document.status,
      comment: document.comment || undefined,
      createdBy: document.createdBy || undefined,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    };
  }
}
