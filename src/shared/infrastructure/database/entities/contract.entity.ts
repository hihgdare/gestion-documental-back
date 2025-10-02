import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('contracts')
@Index(['employeeId'])
@Index(['departmentId'])
@Index(['managerId'])
@Index(['status'])
export class ContractEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'employee_id' })
  employeeId!: string;

  @Column({ type: 'varchar', length: 200 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'varchar',
    length: 20,
    enum: ['permanent', 'temporary', 'consultant', 'intern'],
  })
  type!: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'draft',
    enum: ['draft', 'active', 'suspended', 'terminated', 'expired'],
  })
  status!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'salary_amount' })
  salaryAmount!: number;

  @Column({ type: 'varchar', length: 3, default: 'CLP', name: 'salary_currency' })
  salaryCurrency!: string;

  @Column({ type: 'date', name: 'start_date' })
  startDate!: Date;

  @Column({ type: 'date', nullable: true, name: 'end_date' })
  endDate?: Date;

  @Column({ type: 'uuid', name: 'department_id' })
  departmentId!: string;

  @Column({ type: 'uuid', name: 'manager_id' })
  managerId!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Relations
  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'employee_id' })
  employee?: UserEntity;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'manager_id' })
  manager?: UserEntity;
}