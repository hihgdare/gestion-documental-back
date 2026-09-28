import { Repository, DataSource, IsNull, LessThanOrEqual, MoreThan, Not } from 'typeorm';
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
    const now = new Date();
    const startsAtLimit = new Date(Math.ceil(now.getTime() / 1000) * 1000);
    const entity = await this.repository.findOne({
      where: [
        { groupId, isActive: true, startsAt: LessThanOrEqual(startsAtLimit), endsAt: IsNull() },
        { groupId, isActive: true, startsAt: LessThanOrEqual(startsAtLimit), endsAt: MoreThan(now) },
      ],
      order: { startsAt: 'DESC' },
    });
    return entity ? GroupPlanEntity.toDomain(entity) : null;
  }

  async existsByPlanId(planId: string): Promise<boolean> {
    return (await this.repository.count({ where: { planId } })) > 0;
  }

  async deactivateOthers(groupId: number, keepId: string): Promise<void> {
    await this.repository.update({ groupId, isActive: true, id: Not(keepId) }, { isActive: false });
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
