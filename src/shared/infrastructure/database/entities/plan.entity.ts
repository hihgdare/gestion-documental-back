import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Plan } from '@domains/plan/entities/plan.entity';
import { PlanBadge } from '@domains/plan/value-objects/plan-badge';
import { FeatureEntity } from './feature.entity';

@Entity('plans')
export class PlanEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  name!: string;

  @Column({ name: 'max_active_colaborators', type: 'int', nullable: true })
  maxActiveColaborators!: number | null;

  @Column({ name: 'max_active_contracts', type: 'int', nullable: true })
  maxActiveContracts!: number | null;

  @Column({ name: 'max_documents', type: 'int', nullable: true })
  maxDocuments!: number | null;

  @Column({ name: 'max_storage_gb', type: 'int', nullable: true, comment: 'NULL means unlimited' })
  maxStorageGb!: number | null;

  @Column({ name: 'max_active_users', type: 'int', nullable: true, comment: 'NULL means unlimited' })
  maxActiveUsers!: number | null;

  @Column({ name: 'is_visible', type: 'tinyint', default: 1 })
  isVisible!: boolean;

  @Column({ type: 'varchar', length: 20, nullable: true })
  badge!: PlanBadge | null;

  @ManyToMany(() => FeatureEntity)
  @JoinTable({
    name: 'plan_features',
    joinColumn: { name: 'plan_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'feature_id', referencedColumnName: 'id' },
  })
  features!: FeatureEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  static fromDomain(plan: Plan): PlanEntity {
    const entity = new PlanEntity();
    if (plan.id) entity.id = plan.id;
    entity.name = plan.name;
    entity.maxActiveColaborators = plan.maxActiveColaborators;
    entity.maxActiveContracts = plan.maxActiveContracts;
    entity.maxDocuments = plan.maxDocuments;
    entity.maxStorageGb = plan.maxStorageGb;
    entity.maxActiveUsers = plan.maxActiveUsers;
    entity.isVisible = plan.isVisible;
    entity.badge = plan.badge;
    return entity;
  }

  static toDomain(entity: PlanEntity): Plan {
    return new Plan({
      id: entity.id,
      name: entity.name,
      maxActiveColaborators: entity.maxActiveColaborators,
      maxActiveContracts: entity.maxActiveContracts,
      maxDocuments: entity.maxDocuments,
      maxStorageGb: entity.maxStorageGb,
      maxActiveUsers: entity.maxActiveUsers,
      isVisible: !!entity.isVisible,
      badge: entity.badge,
      features: (entity.features || []).map((f) => FeatureEntity.toDomain(f).toJSON()),
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}
