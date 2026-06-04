import { Repository } from 'typeorm';
import { type SignatureFlowParticipantRepository } from '@domains/signature-flow/repositories/signature-flow-participant.repository';
import {
  SignatureFlowParticipant,
  type SignatureFlowParticipantProps,
} from '@domains/signature-flow/entities/signature-flow-participant.entity';
import { SignatureFlowParticipantEntity } from '../database/entities/signature-flow-participant.entity';
import { AppDataSource } from '../database/typeorm.config';

export class TypeOrmSignatureFlowParticipantRepository implements SignatureFlowParticipantRepository {
  private repository: Repository<SignatureFlowParticipantEntity>;

  constructor() {
    this.repository = AppDataSource.getRepository(SignatureFlowParticipantEntity);
  }

  async findById(id: string): Promise<SignatureFlowParticipant | null> {
    const entity = await this.repository.findOne({ where: { id } });
    if (!entity) return null;
    return this.toDomain(entity);
  }

  async findByFlowId(flowId: string): Promise<SignatureFlowParticipant[]> {
    const entities = await this.repository.find({
      where: { flowId },
      order: { order: 'ASC', createdAt: 'ASC' },
    });
    return entities.map((e) => this.toDomain(e));
  }

  async findByFlowIdAndRole(flowId: string, role: string): Promise<SignatureFlowParticipant[]> {
    const entities = await this.repository.find({
      where: { flowId, role },
      order: { order: 'ASC', createdAt: 'ASC' },
    });
    return entities.map((e) => this.toDomain(e));
  }

  async findByUserId(userId: string): Promise<SignatureFlowParticipant[]> {
    const entities = await this.repository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    return entities.map((e) => this.toDomain(e));
  }

  async save(participant: SignatureFlowParticipant): Promise<SignatureFlowParticipant> {
    const entity = this.toEntity(participant);
    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  async update(participant: SignatureFlowParticipant): Promise<SignatureFlowParticipant> {
    const entity = this.toEntity(participant);
    await this.repository.update(participant.id, entity);
    const updated = await this.repository.findOneOrFail({ where: { id: participant.id } });
    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async deleteByFlowId(flowId: string): Promise<void> {
    await this.repository.delete({ flowId });
  }

  private toDomain(entity: SignatureFlowParticipantEntity): SignatureFlowParticipant {
    const props: SignatureFlowParticipantProps = {
      id: entity.id,
      flowId: entity.flowId,
      userId: entity.userId ?? null,
      externalName: entity.externalName ?? null,
      externalEmail: entity.externalEmail ?? null,
      role: entity.role,
      order: entity.order ?? null,
      status: entity.status,
      actionAt: entity.actionAt ?? null,
      rejectionComment: entity.rejectionComment ?? null,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
    return SignatureFlowParticipant.create(props);
  }

  private toEntity(participant: SignatureFlowParticipant): Partial<SignatureFlowParticipantEntity> {
    return {
      id: participant.id,
      flowId: participant.flowId,
      userId: participant.userId ?? undefined,
      externalName: participant.externalName ?? undefined,
      externalEmail: participant.externalEmail ?? undefined,
      role: participant.role,
      order: participant.order ?? undefined,
      status: participant.status,
      actionAt: participant.actionAt ?? undefined,
      rejectionComment: participant.rejectionComment ?? undefined,
    };
  }
}
