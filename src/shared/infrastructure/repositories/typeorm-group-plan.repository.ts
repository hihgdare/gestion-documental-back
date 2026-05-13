import { Repository, DataSource } from 'typeorm';
import { GroupPlanRepository } from '@domains/plan/repositories/group-plan.repository';
import { GroupPlan } from '@domains/plan/entities/group-plan.entity';
import { GroupPlanEntity } from '../database/entities/group-plan.entity';
import { AppDataSource } from '../database/typeorm.config';

export class TypeOrmGroupPlanRepository implements GroupPlanRepository {
  private repository: Repository<GroupPlanEntity>;

  constructor(dataSource?: DataSource) {
    this.repository = (dataSource || AppDataSource).getRepository(GroupPlanEntity);
  }

  async findById(id: string): Promise<GroupPlan | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? GroupPlanEntity.toDomain(entity) : null;
  }

  async findByGroupId(groupId: number): Promise<GroupPlan[]> {
    const entities = await this.repository.find({
      where: { groupId },
      order: { startsAt: 'DESC' },
    });
    return entities.map(GroupPlanEntity.toDomain);
  }

  async findActiveByGroupId(groupId: number): Promise<GroupPlan | null> {
    const entity = await this.repository.findOne({
      where: { groupId, isActive: true },
      order: { startsAt: 'DESC' },
    });
    return entity ? GroupPlanEntity.toDomain(entity) : null;
  }

  async save(groupPlan: GroupPlan): Promise<GroupPlan> {
    const entity = GroupPlanEntity.fromDomain(groupPlan);
    const saved = await this.repository.save(entity);
    return GroupPlanEntity.toDomain(saved);
  }

  async update(groupPlan: GroupPlan): Promise<GroupPlan> {
    const entity = GroupPlanEntity.fromDomain(groupPlan);
    const saved = await this.repository.save(entity);
    return GroupPlanEntity.toDomain(saved);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
