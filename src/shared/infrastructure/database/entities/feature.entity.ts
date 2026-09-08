import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Feature } from '@domains/feature/entities/feature.entity';
import { FeatureCategoryEntity } from './feature-category.entity';

@Entity('features')
export class FeatureEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'category_id', type: 'varchar', length: 36 })
  categoryId!: string;

  @ManyToOne(() => FeatureCategoryEntity)
  @JoinColumn({ name: 'category_id' })
  category?: FeatureCategoryEntity;

  @Column({ type: 'varchar', length: 100, unique: true })
  key!: string;

  @Column({ type: 'varchar', length: 150 })
  name!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  static fromDomain(feature: Feature): FeatureEntity {
    const entity = new FeatureEntity();
    if (feature.id) entity.id = feature.id;
    entity.categoryId = feature.categoryId;
    entity.key = feature.key;
    entity.name = feature.name;
    return entity;
  }

  static toDomain(entity: FeatureEntity): Feature {
    return new Feature({
      id: entity.id,
      categoryId: entity.categoryId,
      key: entity.key,
      name: entity.name,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}
