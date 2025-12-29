import { Repository, IsNull } from 'typeorm';
import { type IDocumentModelRepository } from '@domains/document-model/repositories/document-model.repository.interface';
import { DocumentModel, type DocumentModelProps } from '@domains/document-model/entities/document-model.entity';
import { DocumentModelEntity } from '../database/entities/document-model.entity';
import { AppDataSource } from '../database/typeorm.config';
import { NotFoundError } from '@shared/domain/errors';

export class TypeOrmDocumentModelRepository implements IDocumentModelRepository {
  private repository: Repository<DocumentModelEntity>;

  constructor() {
    this.repository = AppDataSource.getRepository(DocumentModelEntity);
  }

  async findAll(): Promise<DocumentModel[]> {
    const entities = await this.repository.find({
      where: { deletedAt: IsNull() },
      relations: ['documentType', 'documentSubtype'],
      order: { createdAt: 'DESC' },
    });
    return entities.map(entity => this.toDomain(entity));
  }

  async findById(id: string): Promise<DocumentModel | null> {
    const entity = await this.repository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['documentType', 'documentSubtype'],
    });
    if (!entity) return null;
    return this.toDomain(entity);
  }

  async findByFamilyId(familyId: string): Promise<DocumentModel[]> {
    const entities = await this.repository.find({
      where: { familyId, deletedAt: IsNull() },
      relations: ['documentType', 'documentSubtype'],
      order: { createdAt: 'DESC' },
    });
    return entities.map(entity => this.toDomain(entity));
  }

  async findByFamilyTypeSubtype(
    familyId: string,
    documentTypeId: string,
    documentSubtypeId: string,
  ): Promise<DocumentModel | null> {
    const entity = await this.repository.findOne({
      where: {
        familyId,
        documentTypeId,
        documentSubtypeId,
        deletedAt: IsNull(),
      },
      relations: ['documentType', 'documentSubtype'],
    });
    if (!entity) return null;
    return this.toDomain(entity);
  }

  async create(documentModel: DocumentModel): Promise<DocumentModel> {
    const entity = this.toEntity(documentModel);
    const savedEntity = await this.repository.save(entity);
    const createdEntity = await this.repository.findOne({
      where: { id: savedEntity.id },
      relations: ['documentType', 'documentSubtype'],
    });
    return this.toDomain(createdEntity!);
  }

  async update(documentModel: DocumentModel): Promise<DocumentModel> {
    const entity = this.toEntity(documentModel);
    await this.repository.update(documentModel.id, entity);
    const updatedEntity = await this.repository.findOne({
      where: { id: documentModel.id },
      relations: ['documentType', 'documentSubtype'],
    });
    if (!updatedEntity) {
      throw new NotFoundError('Modelo de documento no encontrado');
    }
    return this.toDomain(updatedEntity);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async softDelete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }

  async restore(id: string): Promise<void> {
    await this.repository.restore(id);
  }

  private toDomain(entity: DocumentModelEntity): DocumentModel {
    const props: DocumentModelProps = {
      id: entity.id,
      familyId: entity.familyId,
      documentTypeId: entity.documentTypeId,
      documentSubtypeId: entity.documentSubtypeId,
      requiredForContract: entity.requiredForContract,
      requiredForColaborator: entity.requiredForColaborator,
      documentTypeName: entity.documentType?.name,
      documentSubtypeName: entity.documentSubtype?.name,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt,
    };
    return DocumentModel.create(props);
  }

  private toEntity(documentModel: DocumentModel): Partial<DocumentModelEntity> {
    return {
      id: documentModel.id,
      familyId: documentModel.familyId,
      documentTypeId: documentModel.documentTypeId,
      documentSubtypeId: documentModel.documentSubtypeId,
      requiredForContract: documentModel.requiredForContract,
      requiredForColaborator: documentModel.requiredForColaborator,
      createdAt: documentModel.createdAt,
      updatedAt: documentModel.updatedAt,
      deletedAt: documentModel.deletedAt,
    };
  }
}
