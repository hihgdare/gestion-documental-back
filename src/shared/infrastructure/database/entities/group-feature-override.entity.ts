import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { GroupFeatureOverride } from '@domains/feature/entities/group-feature-override.entity';

@Entity('group_feature_overrides')
export class GroupFeatureOverrideEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'group_id', type: 'int' })
  groupId!: number;

  @Column({ name: 'feature_id', type: 'varchar', length: 36 })
  featureId!: string;

  @Column({ type: 'tinyint' })
  granted!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  static fromDomain(override: GroupFeatureOverride): GroupFeatureOverrideEntity {
    const entity = new GroupFeatureOverrideEntity();
    if (override.id) entity.id = override.id;
    entity.groupId = override.groupId;
    entity.featureId = override.featureId;
    entity.granted = override.granted;
    return entity;
  }

  static toDomain(entity: GroupFeatureOverrideEntity): GroupFeatureOverride {
    return new GroupFeatureOverride({
      id: entity.id,
      groupId: entity.groupId,
      featureId: entity.featureId,
      granted: !!entity.granted,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}
