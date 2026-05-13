import { Repository, DataSource, Not } from 'typeorm';
import { PlanRepository } from '@domains/plan/repositories/plan.repository';
import { Plan } from '@domains/plan/entities/plan.entity';
import { PlanEntity } from '../database/entities/plan.entity';
import { AppDataSource } from '../database/typeorm.config';

export class TypeOrmPlanRepository implements PlanRepository {
  private repository: Repository<PlanEntity>;

  constructor(dataSource?: DataSource) {
    this.repository = (dataSource || AppDataSource).getRepository(PlanEntity);
  }

  async findById(id: string): Promise<Plan | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? PlanEntity.toDomain(entity) : null;
  }

  async findAll(): Promise<Plan[]> {
    const entities = await this.repository.find({ order: { name: 'ASC' } });
    return entities.map(PlanEntity.toDomain);
  }

  async existsByName(name: string, excludeId?: string): Promise<boolean> {
    const where: Record<string, unknown> = { name };
    if (excludeId) {
      where['id'] = Not(excludeId);
    }
    const count = await this.repository.count({ where });
    return count > 0;
  }

  async save(plan: Plan): Promise<Plan> {
    const entity = PlanEntity.fromDomain(plan);
    const saved = await this.repository.save(entity);
    return PlanEntity.toDomain(saved);
  }

  async update(plan: Plan): Promise<Plan> {
    const entity = PlanEntity.fromDomain(plan);
    const saved = await this.repository.save(entity);
    return PlanEntity.toDomain(saved);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
