import { Repository } from 'typeorm';
import { type SignatureFlowRepository } from '@domains/signature-flow/repositories/signature-flow.repository';
import { SignatureFlow, type SignatureFlowProps } from '@domains/signature-flow/entities/signature-flow.entity';
import { SignatureFlowEntity } from '../database/entities/signature-flow.entity';
import { AppDataSource } from '../database/typeorm.config';
import { SignatureFlowStatus } from '@domains/signature-flow/value-objects/signature-flow-enums';

export class TypeOrmSignatureFlowRepository implements SignatureFlowRepository {
  private repository: Repository<SignatureFlowEntity>;

  constructor() {
    this.repository = AppDataSource.getRepository(SignatureFlowEntity);
  }

  async findById(id: string): Promise<SignatureFlow | null> {
    const entity = await this.repository.findOne({ where: { id } });
    if (!entity) return null;
    return this.toDomain(entity);
  }

  async findByDocumentId(documentId: string): Promise<SignatureFlow[]> {
    const entities = await this.repository.find({
      where: { documentId },
      order: { createdAt: 'DESC' },
    });
    return entities.map((e) => this.toDomain(e));
  }

  async findActiveByDocumentId(documentId: string): Promise<SignatureFlow | null> {
    const entity = await this.repository.findOne({
      where: { documentId },
      order: { createdAt: 'DESC' },
    });
    if (!entity) return null;
    if (entity.status === SignatureFlowStatus.SIGNED || entity.status === SignatureFlowStatus.REJECTED) return null;
    return this.toDomain(entity);
  }

  async save(flow: SignatureFlow): Promise<SignatureFlow> {
    const entity = this.toEntity(flow);
    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  async update(flow: SignatureFlow): Promise<SignatureFlow> {
    const entity = this.toEntity(flow);
    await this.repository.update(flow.id, entity);
    const updated = await this.repository.findOneOrFail({ where: { id: flow.id } });
    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  private toDomain(entity: SignatureFlowEntity): SignatureFlow {
    const props: SignatureFlowProps = {
      id: entity.id,
      documentId: entity.documentId,
      orderType: entity.orderType,
      status: entity.status,
      sentAt: entity.sentAt ?? null,
      sentBy: entity.sentBy ?? null,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
    return SignatureFlow.create(props);
  }

  private toEntity(flow: SignatureFlow): Partial<SignatureFlowEntity> {
    return {
      id: flow.id,
      documentId: flow.documentId,
      orderType: flow.orderType,
      status: flow.status,
      sentAt: flow.sentAt ?? undefined,
      sentBy: flow.sentBy ?? undefined,
    };
  }
}
