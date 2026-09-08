import { Repository, DataSource, In } from 'typeorm';
import { FeatureRepository } from '@domains/feature/repositories/feature.repository';
import { Feature, FeatureProps } from '@domains/feature/entities/feature.entity';
import { FeatureEntity } from '../database/entities/feature.entity';
import { AppDataSource } from '../database/typeorm.config';

export class TypeOrmFeatureRepository implements FeatureRepository {
  private repository: Repository<FeatureEntity>;

  constructor(dataSource?: DataSource) {
    this.repository = (dataSource || AppDataSource).getRepository(FeatureEntity);
  }

  async findAll(): Promise<Feature[]> {
    const entities = await this.repository.find({ order: { name: 'ASC' } });
    return entities.map(FeatureEntity.toDomain);
  }

  async findIn(ids: string[]): Promise<Feature[]> {
    if (ids.length === 0) return [];
    const entities = await this.repository.findBy({ id: In(ids) });
    return entities.map(FeatureEntity.toDomain);
  }

  async findByKey(key: string): Promise<Feature | null> {
    const entity = await this.repository.findOne({ where: { key } });
    return entity ? FeatureEntity.toDomain(entity) : null;
  }

  async upsertByKey(props: FeatureProps): Promise<Feature> {
    const existing = await this.repository.findOne({ where: { key: props.key } });
    const feature = new Feature({ ...props, id: existing?.id });
    const entity = FeatureEntity.fromDomain(feature);
    const saved = await this.repository.save(entity);
    return FeatureEntity.toDomain(saved);
  }
}
