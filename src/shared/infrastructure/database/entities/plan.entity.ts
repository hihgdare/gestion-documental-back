import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Plan } from '@domains/plan/entities/plan.entity';

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
    return entity;
  }

  static toDomain(entity: PlanEntity): Plan {
    return new Plan({
      id: entity.id,
      name: entity.name,
      maxActiveColaborators: entity.maxActiveColaborators,
      maxActiveContracts: entity.maxActiveContracts,
      maxDocuments: entity.maxDocuments,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}
