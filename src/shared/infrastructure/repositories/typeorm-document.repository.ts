import { Repository, LessThanOrEqual } from 'typeorm';
import { type DocumentRepository } from '@domains/document/repositories/document.repository';
import { Document, type DocumentProps } from '@domains/document/entities/document.entity';
import { DocumentEntity } from '../database/entities/document.entity';
import { AppDataSource } from '../database/typeorm.config';

export class TypeOrmDocumentRepository implements DocumentRepository {
  private repository: Repository<DocumentEntity>;

  constructor() {
    this.repository = AppDataSource.getRepository(DocumentEntity);
  }

  async findById(id: string): Promise<Document | null> {
    const documentEntity = await this.repository.findOne({ where: { id } });
    if (!documentEntity) return null;
    return this.toDomain(documentEntity);
  }

  async findAll(): Promise<Document[]> {
    const documentEntities = await this.repository.find({
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
      order: { createdAt: 'DESC' },
    });
    return documentEntities.map(entity => this.toDomain(entity));
  }

  async findByDocumentTypeId(documentTypeId: string): Promise<Document[]> {
    const documentEntities = await this.repository.find({
      where: { documentTypeId },
      order: { createdAt: 'DESC' },
    });
    return documentEntities.map(entity => this.toDomain(entity));
  }

  async findByDocumentSubtypeId(documentSubtypeId: string): Promise<Document[]> {
    const documentEntities = await this.repository.find({
      where: { documentSubtypeId },
      order: { createdAt: 'DESC' },
    });
    return documentEntities.map(entity => this.toDomain(entity));
  }

  async findExpiredDocuments(): Promise<Document[]> {
    const documentEntities = await this.repository.find({
      where: {
        expirationDate: LessThanOrEqual(new Date()),
      },
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
      .where('document.expiration_date IS NOT NULL')
      .andWhere('document.expiration_date > :today', { today })
      .andWhere('document.expiration_date <= :futureDate', { futureDate })
      .orderBy('document.expiration_date', 'ASC')
      .getMany();

    return documentEntities.map(entity => this.toDomain(entity));
  }

  private toDomain(entity: DocumentEntity): Document {
    const props: DocumentProps = {
      id: entity.id,
      documentTypeId: entity.documentTypeId,
      documentSubtypeId: entity.documentSubtypeId,
      name: entity.name,
      issuedDate: entity.issuedDate,
      expirationDate: entity.expirationDate,
      contractId: entity.contractId,
      description: entity.description,
      documentUrl: entity.documentUrl,
      status: entity.status,
      createdBy: entity.createdBy,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
    return Document.create(props);
  }

  private toEntity(document: Document): Partial<DocumentEntity> {
    return {
      id: document.id,
      documentTypeId: document.documentTypeId,
      documentSubtypeId: document.documentSubtypeId,
      name: document.name,
      issuedDate: document.issuedDate,
      expirationDate: document.expirationDate || undefined,
      contractId: document.contractId || undefined,
      description: document.description,
      documentUrl: document.documentUrl,
      status: document.status,
      createdBy: document.createdBy || undefined,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    };
  }
}
