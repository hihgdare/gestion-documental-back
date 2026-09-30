import { Repository, DataSource } from 'typeorm';
import { FeatureCategoryRepository } from '@domains/feature/repositories/feature-category.repository';
import { FeatureCategory, FeatureCategoryProps } from '@domains/feature/entities/feature-category.entity';
import { FeatureCategoryEntity } from '../database/entities/feature-category.entity';
import { AppDataSource } from '../database/typeorm.config';

export class TypeOrmFeatureCategoryRepository implements FeatureCategoryRepository {
  private repository: Repository<FeatureCategoryEntity>;

  constructor(dataSource?: DataSource) {
    this.repository = (dataSource || AppDataSource).getRepository(FeatureCategoryEntity);
  }

  async findAll(): Promise<FeatureCategory[]> {
    const entities = await this.repository.find({ order: { name: 'ASC' } });
    return entities.map(FeatureCategoryEntity.toDomain);
  }

  async findByKey(key: string): Promise<FeatureCategory | null> {
    const entity = await this.repository.findOne({ where: { key } });
    return entity ? FeatureCategoryEntity.toDomain(entity) : null;
  }

  async upsertByKey(props: FeatureCategoryProps): Promise<FeatureCategory> {
    const existing = await this.repository.findOne({ where: { key: props.key } });
    const category = new FeatureCategory({ ...props, id: existing?.id });
    const entity = FeatureCategoryEntity.fromDomain(category);
    const saved = await this.repository.save(entity);
    return FeatureCategoryEntity.toDomain(saved);
  }
}
