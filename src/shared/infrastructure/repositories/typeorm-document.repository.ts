import { Repository, LessThanOrEqual, In, IsNull } from 'typeorm';
import { type DocumentRepository } from '@domains/document/repositories/document.repository';
import { Document, type DocumentProps } from '@domains/document/entities/document.entity';
import { DocumentStatus } from '@domains/document/value-objects/document-enums';
import { DocumentEntity } from '../database/entities/document.entity';
import { ColaboratorEntity } from '../database/entities/colaborators.entity';
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
      relations: ['contract', 'documentType', 'documentSubtype', 'colaborators'],
    });
    if (!documentEntity) return null;
    return this.toDomain(documentEntity);
  }

  async findAll(filters?: {
    contractId?: string;
    colaboratorId?: string;
    requiredForContract?: boolean;
    requiredForColaborator?: boolean;
    status?: DocumentStatus | DocumentStatus[];
  }): Promise<Document[]> {
    const query = this.repository
      .createQueryBuilder('document')
      .leftJoinAndSelect('document.contract', 'contract')
      .leftJoinAndSelect('document.documentType', 'documentType')
      .leftJoinAndSelect('document.documentSubtype', 'documentSubtype')
      .leftJoinAndSelect('document.colaborators', 'colaborators')
      .where('document.deletedAt IS NULL');

    if (filters?.contractId) {
      query.andWhere('document.contractId = :contractId', { contractId: filters.contractId });
    }

    if (filters?.colaboratorId) {
      query.andWhere('colaborators.id = :colaboratorId', { colaboratorId: filters.colaboratorId });
    }

    if (filters?.requiredForContract !== undefined) {
      query.andWhere('document.requiredForContract = :requiredForContract', { requiredForContract: filters.requiredForContract });
    }

    if (filters?.requiredForColaborator !== undefined) {
      query.andWhere('document.requiredForColaborator = :requiredForColaborator', { requiredForColaborator: filters.requiredForColaborator });
    }

    if (filters?.status) {
      const status = Array.isArray(filters.status) ? filters.status : [filters.status];
      query.andWhere('document.status IN (:...status)', { status });
    }

    const documentEntities = await query.orderBy('document.createdAt', 'DESC').getMany();
    return documentEntities.map(entity => this.toDomain(entity));
  }

  async save(document: Document): Promise<Document> {
    const documentEntity = this.toEntity(document);
    const savedEntity = await this.repository.save(documentEntity as any);

    // Manejar la relación N:M con colaboradores
    if (document.colaboratorIds && document.colaboratorIds.length > 0) {
      const colaboratorRepository = AppDataSource.getRepository(ColaboratorEntity);
      const colaborators = await colaboratorRepository.find({
        where: { id: In(document.colaboratorIds) },
      });
      savedEntity.colaborators = colaborators;
      await this.repository.save(savedEntity);
    }

    return this.findById(savedEntity.id) as Promise<Document>;
  }

  async update(document: Document): Promise<Document> {
    const documentEntity = this.toEntity(document);
    await this.repository.update(document.id, documentEntity as any);

    // Manejar la relación N:M con colaboradores
    if (document.colaboratorIds && document.colaboratorIds.length > 0) {
      const colaboratorRepository = AppDataSource.getRepository(ColaboratorEntity);
      const colaborators = await colaboratorRepository.find({
        where: { id: In(document.colaboratorIds) },
      });
      const updatedEntity = await this.repository.findOne({ where: { id: document.id } });
      if (updatedEntity) {
        updatedEntity.colaborators = colaborators;
        await this.repository.save(updatedEntity);
      }
    } else {
      // Si no hay colaboradores, limpiar la relación
      const updatedEntity = await this.repository.findOne({ where: { id: document.id } });
      if (updatedEntity) {
        updatedEntity.colaborators = [];
        await this.repository.save(updatedEntity);
      }
    }

    const updatedEntity = await this.repository.findOne({
      where: { id: document.id },
      relations: ['contract', 'documentType', 'documentSubtype', 'colaborators'],
    });
    return this.toDomain(updatedEntity!);
  }

  async delete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }

  async findByContractId(contractId: string): Promise<Document[]> {
    const documentEntities = await this.repository.find({
      where: { contractId, deletedAt: IsNull() },
      relations: ['contract', 'documentType', 'documentSubtype', 'colaborators'],
      order: { createdAt: 'DESC' },
    });
    return documentEntities.map(entity => this.toDomain(entity));
  }

  async findByTypeAndSubtypeId(typeId: string, subtypeId: string): Promise<Document[]> {
    const documentEntities = await this.repository.find({
      where: { documentTypeId: typeId, documentSubtypeId: subtypeId, deletedAt: IsNull() },
      relations: ['contract', 'documentType', 'documentSubtype', 'colaborators'],
      order: { createdAt: 'DESC' },
    });
    return documentEntities.map(entity => this.toDomain(entity));
  }

  async findByColaboratorIds(colaboratorIds: string[]): Promise<Document[]> {
    if (colaboratorIds.length === 0) return [];
    const documentEntities = await this.repository
      .createQueryBuilder('document')
      .leftJoinAndSelect('document.colaborators', 'colaborators')
      .leftJoinAndSelect('document.contract', 'contract')
      .leftJoinAndSelect('document.documentType', 'documentType')
      .leftJoinAndSelect('document.documentSubtype', 'documentSubtype')
      .where('colaborators.id IN (:...colaboratorIds)', { colaboratorIds })
      .andWhere('document.deletedAt IS NULL')
      .orderBy('document.createdAt', 'DESC')
      .getMany();
    return documentEntities.map(entity => this.toDomain(entity));
  }

  async findExpiredDocuments(): Promise<Document[]> {
    const documentEntities = await this.repository.find({
      where: {
        expirationDate: LessThanOrEqual(new Date()),
        deletedAt: IsNull(),
      },
      relations: ['contract', 'documentType', 'documentSubtype', 'colaborators'],
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
      .leftJoinAndSelect('document.documentType', 'documentType')
      .leftJoinAndSelect('document.documentSubtype', 'documentSubtype')
      .leftJoinAndSelect('document.colaborators', 'colaborators')
      .where('document.expiration_date IS NOT NULL')
      .andWhere('document.expiration_date > :today', { today })
      .andWhere('document.expiration_date <= :futureDate', { futureDate })
      .andWhere('document.deleted_at IS NULL')
      .orderBy('document.expiration_date', 'ASC')
      .getMany();

    return documentEntities.map(entity => this.toDomain(entity));
  }

  async existsByTypeSubtypeAndColaborator(typeId: string, subtypeId: string, colaboratorIds: string[], excludeId?: string): Promise<boolean> {
    if (colaboratorIds.length === 0) return false;

    const query = this.repository
      .createQueryBuilder('document')
      .leftJoin('document.colaborators', 'colaborators')
      .where('document.documentTypeId = :typeId', { typeId })
      .andWhere('document.documentSubtypeId = :subtypeId', { subtypeId })
      .andWhere('document.deleted_at IS NULL')
      .andWhere('colaborators.id IN (:...colaboratorIds)', { colaboratorIds });

    if (excludeId) {
      query.andWhere('document.id != :excludeId', { excludeId });
    }

    const existing = await query.getOne();
    return !!existing;
  }

  async existsByTypeSubtypeContractColaborator(
    typeId: string,
    subtypeId: string,
    contractId: string,
    colaboratorIds: string[],
    excludeId?: string,
  ): Promise<boolean> {
    if (colaboratorIds.length === 0) return false;

    const query = this.repository
      .createQueryBuilder('document')
      .leftJoin('document.colaborators', 'colaborators')
      .where('document.documentTypeId = :typeId', { typeId })
      .andWhere('document.documentSubtypeId = :subtypeId', { subtypeId })
      .andWhere('document.contract_id = :contractId', { contractId })
      .andWhere('document.deleted_at IS NULL')
      .andWhere('colaborators.id IN (:...colaboratorIds)', { colaboratorIds });

    if (excludeId) {
      query.andWhere('document.id != :excludeId', { excludeId });
    }

    const existing = await query.getOne();
    return !!existing;
  }

  private toDomain(entity: DocumentEntity): Document {
    const colaboratorIds = entity.colaborators ? entity.colaborators.map(c => c.id) : [];
    const props: DocumentProps = {
      id: entity.id,
      documentTypeId: entity.documentTypeId,
      documentSubtypeId: entity.documentSubtypeId,
      colaboratorIds: colaboratorIds.length > 0 ? colaboratorIds : [],
      documentTypeName: entity.documentType?.name,
      documentSubtypeName: entity.documentSubtype?.name,
      name: entity.name,
      issuedDate: entity.issuedDate,
      expirationDate: entity.expirationDate,
      contractId: entity.contractId,
      contractNumber: entity.contract?.contractNumber,
      contractProjectName: entity.contract?.nombreProyecto,
      description: entity.description,
      documentUrl: entity.documentUrl,
      status: entity.status,
      requiredForContract: entity.requiredForContract,
      requiredForColaborator: entity.requiredForColaborator,
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
      documentTypeId: document.documentTypeId,
      documentSubtypeId: document.documentSubtypeId,
      name: document.name,
      issuedDate: document.issuedDate ? DateUtils.toLocalDate(document.issuedDate)! : undefined,
      expirationDate: document.expirationDate ? DateUtils.toLocalDate(document.expirationDate) : undefined,
      contractId: document.contractId || undefined,
      description: document.description,
      documentUrl: document.documentUrl,
      status: document.status,
      requiredForContract: document.requiredForContract,
      requiredForColaborator: document.requiredForColaborator,
      comment: document.comment || undefined,
      createdBy: document.createdBy || undefined,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    };
  }
}
