import { Repository, LessThanOrEqual, In, IsNull } from 'typeorm';
import { type DocumentRepository } from '@domains/document/repositories/document.repository';
import { Document, type DocumentProps } from '@domains/document/entities/document.entity';
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
      relations: ['contract', 'template', 'template.documentType', 'template.documentSubtype', 'colaborators'],
    });
    if (!documentEntity) return null;
    return this.toDomain(documentEntity);
  }

  async findAll(): Promise<Document[]> {
    const documentEntities = await this.repository.find({
      where: { deletedAt: IsNull() },
      relations: ['contract', 'template', 'template.documentType', 'template.documentSubtype', 'colaborators'],
      order: { createdAt: 'DESC' },
    });
    return documentEntities.map(entity => this.toDomain(entity));
  }

  async save(document: Document): Promise<Document> {
    const documentEntity = this.toEntity(document);
    const savedEntity = await this.repository.save(documentEntity);

    // Manejar la relación N:M con colaboradores
    if (document.colaboratorIds && document.colaboratorIds.length > 0) {
      const colaboratorRepository = AppDataSource.getRepository(ColaboratorEntity);
      const colaborators = await colaboratorRepository.find({
        where: { id: In(document.colaboratorIds) },
      });
      savedEntity.colaborators = colaborators;
      await this.repository.save(savedEntity);
    }

    return this.toDomain(savedEntity);
  }

  async update(document: Document): Promise<Document> {
    const documentEntity = this.toEntity(document);
    await this.repository.update(document.id, documentEntity);

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
      relations: ['contract', 'template', 'template.documentType', 'template.documentSubtype', 'colaborators'],
    });
    return this.toDomain(updatedEntity!);
  }

  async delete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }

  async findByContractId(contractId: string): Promise<Document[]> {
    const documentEntities = await this.repository.find({
      where: { contractId, deletedAt: IsNull() },
      relations: ['contract', 'template', 'template.documentType', 'template.documentSubtype', 'colaborators'],
      order: { createdAt: 'DESC' },
    });
    return documentEntities.map(entity => this.toDomain(entity));
  }

  async findByTemplateId(templateId: string): Promise<Document[]> {
    const documentEntities = await this.repository.find({
      where: { templateId, deletedAt: IsNull() },
      relations: ['contract', 'template', 'template.documentType', 'template.documentSubtype', 'colaborators'],
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
      .leftJoinAndSelect('document.template', 'template')
      .leftJoinAndSelect('template.documentType', 'documentType')
      .leftJoinAndSelect('template.documentSubtype', 'documentSubtype')
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
      relations: ['contract', 'template', 'template.documentType', 'template.documentSubtype', 'colaborators'],
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
      .leftJoinAndSelect('document.colaborators', 'colaborators')
      .where('document.expiration_date IS NOT NULL')
      .andWhere('document.expiration_date > :today', { today })
      .andWhere('document.expiration_date <= :futureDate', { futureDate })
      .andWhere('document.deleted_at IS NULL')
      .orderBy('document.expiration_date', 'ASC')
      .getMany();

    return documentEntities.map(entity => this.toDomain(entity));
  }

  async existsByTemplateAndColaborator(templateId: string, colaboratorIds: string[], excludeId?: string): Promise<boolean> {
    if (colaboratorIds.length === 0) return false;

    const query = this.repository
      .createQueryBuilder('document')
      .leftJoinAndSelect('document.colaborators', 'colaborators')
      .where('document.template_id = :templateId', { templateId })
      .andWhere('document.deleted_at IS NULL')
      .andWhere('colaborators.id IN (:...colaboratorIds)', { colaboratorIds });

    if (excludeId) {
      query.andWhere('document.id != :excludeId', { excludeId });
    }

    const existing = await query.getOne();
    return !!existing;
  }

  async existsByTemplateContractColaborator(
    templateId: string,
    contractId: string,
    colaboratorIds: string[],
    excludeId?: string,
  ): Promise<boolean> {
    if (colaboratorIds.length === 0) return false;

    const query = this.repository
      .createQueryBuilder('document')
      .leftJoinAndSelect('document.colaborators', 'colaborators')
      .where('document.template_id = :templateId', { templateId })
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
      templateId: entity.templateId,
      colaboratorIds: colaboratorIds.length > 0 ? colaboratorIds : [],
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
      name: document.name,
      issuedDate: document.issuedDate ? DateUtils.toLocalDate(document.issuedDate)! : undefined,
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
