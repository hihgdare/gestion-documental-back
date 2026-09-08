import { Repository, DataSource } from 'typeorm';
import { GroupFeatureOverrideRepository } from '@domains/feature/repositories/group-feature-override.repository';
import { GroupFeatureOverride } from '@domains/feature/entities/group-feature-override.entity';
import { GroupFeatureOverrideEntity } from '../database/entities/group-feature-override.entity';
import { AppDataSource } from '../database/typeorm.config';

export class TypeOrmGroupFeatureOverrideRepository implements GroupFeatureOverrideRepository {
  private repository: Repository<GroupFeatureOverrideEntity>;

  constructor(dataSource?: DataSource) {
    this.repository = (dataSource || AppDataSource).getRepository(GroupFeatureOverrideEntity);
  }

  async findByGroupId(groupId: number): Promise<GroupFeatureOverride[]> {
    const entities = await this.repository.find({ where: { groupId } });
    return entities.map(GroupFeatureOverrideEntity.toDomain);
  }

  async upsert(groupId: number, featureId: string, granted: boolean): Promise<GroupFeatureOverride> {
    const existing = await this.repository.findOne({ where: { groupId, featureId } });
    const override = new GroupFeatureOverride({ id: existing?.id, groupId, featureId, granted });
    const entity = GroupFeatureOverrideEntity.fromDomain(override);
    const saved = await this.repository.save(entity);
    return GroupFeatureOverrideEntity.toDomain(saved);
  }

  async remove(groupId: number, featureId: string): Promise<void> {
    await this.repository.delete({ groupId, featureId });
  }
}
