import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { FeatureCategory } from '@domains/feature/entities/feature-category.entity';

@Entity('feature_categories')
export class FeatureCategoryEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  key!: string;

  @Column({ type: 'varchar', length: 150 })
  name!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  static fromDomain(category: FeatureCategory): FeatureCategoryEntity {
    const entity = new FeatureCategoryEntity();
    if (category.id) entity.id = category.id;
    entity.key = category.key;
    entity.name = category.name;
    return entity;
  }

  static toDomain(entity: FeatureCategoryEntity): FeatureCategory {
    return new FeatureCategory({
      id: entity.id,
      key: entity.key,
      name: entity.name,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}
