import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { GroupPlan } from '@domains/plan/entities/group-plan.entity';
import { GroupEntity } from './group.entity';
import { PlanEntity } from './plan.entity';

@Entity('group_plans')
@Index('IDX_GROUP_PLANS_GROUP_ID', ['groupId'])
@Index('IDX_GROUP_PLANS_PLAN_ID', ['planId'])
@Index('IDX_GROUP_PLANS_IS_ACTIVE', ['isActive'])
export class GroupPlanEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'group_id', type: 'int' })
  groupId!: number;

  @Column({ name: 'plan_id', type: 'varchar', length: 36 })
  planId!: string;

  @Column({ name: 'starts_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  startsAt!: Date;

  @Column({ name: 'ends_at', type: 'timestamp', nullable: true })
  endsAt!: Date | null;

  @Column({ name: 'is_active', type: 'tinyint', default: 1 })
  isActive!: boolean;

  @ManyToOne(() => GroupEntity)
  @JoinColumn({ name: 'group_id' })
  group?: GroupEntity;

  @ManyToOne(() => PlanEntity)
  @JoinColumn({ name: 'plan_id' })
  plan?: PlanEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  static fromDomain(groupPlan: GroupPlan): GroupPlanEntity {
    const entity = new GroupPlanEntity();
    if (groupPlan.id) entity.id = groupPlan.id;
    entity.groupId = groupPlan.groupId;
    entity.planId = groupPlan.planId;
    entity.startsAt = groupPlan.startsAt;
    entity.endsAt = groupPlan.endsAt;
    entity.isActive = groupPlan.isActive;
    return entity;
  }

  static toDomain(entity: GroupPlanEntity): GroupPlan {
    return new GroupPlan({
      id: entity.id,
      groupId: entity.groupId,
      planId: entity.planId,
      startsAt: entity.startsAt,
      endsAt: entity.endsAt,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}
