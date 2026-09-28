import { Repository, DataSource, Not, In } from 'typeorm';
import { PlanRepository } from '@domains/plan/repositories/plan.repository';
import { Plan } from '@domains/plan/entities/plan.entity';
import { PlanEntity } from '../database/entities/plan.entity';
import { FeatureEntity } from '../database/entities/feature.entity';
import { AppDataSource } from '../database/typeorm.config';
import { NotFoundError } from '@shared/domain/errors';

export class TypeOrmPlanRepository implements PlanRepository {
  private repository: Repository<PlanEntity>;
  private featureRepository: Repository<FeatureEntity>;

  constructor(dataSource?: DataSource) {
    const ds = dataSource || AppDataSource;
    this.repository = ds.getRepository(PlanEntity);
    this.featureRepository = ds.getRepository(FeatureEntity);
  }

  async findById(id: string): Promise<Plan | null> {
    const entity = await this.repository.findOne({ where: { id }, relations: ['features'] });
    return entity ? PlanEntity.toDomain(entity) : null;
  }

  async findAll(): Promise<Plan[]> {
    const entities = await this.repository.find({ order: { name: 'ASC' }, relations: ['features'] });
    return entities.map(PlanEntity.toDomain);
  }

  async setFeatures(planId: string, featureIds: string[]): Promise<Plan> {
    const entity = await this.repository.findOne({ where: { id: planId } });
    if (!entity) {
      throw new NotFoundError('Plan not found');
    }

    entity.features = featureIds.length > 0
      ? await this.featureRepository.findBy({ id: In(featureIds) })
      : [];

    await this.repository.save(entity);
    const reloaded = await this.repository.findOne({ where: { id: planId }, relations: ['features'] });
    return PlanEntity.toDomain(reloaded!);
  }

  async existsByName(name: string, excludeId?: string): Promise<boolean> {
    const where: Record<string, unknown> = { name };
    if (excludeId) {
      where['id'] = Not(excludeId);
    }
    const count = await this.repository.count({ where });
    return count > 0;
  }

  async save(plan: Plan, featureIds?: string[]): Promise<Plan> {
    return this.persist(plan, featureIds);
  }

  async update(plan: Plan, featureIds?: string[]): Promise<Plan> {
    return this.persist(plan, featureIds);
  }

  private async persist(plan: Plan, featureIds?: string[]): Promise<Plan> {
    const entity = PlanEntity.fromDomain(plan);
    if (featureIds) {
      entity.features = featureIds.map((id) => Object.assign(new FeatureEntity(), { id }));
    }
    const saved = await this.repository.save(entity);
    if (!featureIds) {
      return PlanEntity.toDomain(saved);
    }
    const reloaded = await this.repository.findOne({ where: { id: saved.id }, relations: ['features'] });
    return PlanEntity.toDomain(reloaded!);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
