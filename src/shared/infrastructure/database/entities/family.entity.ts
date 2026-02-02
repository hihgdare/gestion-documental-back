import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import type { ContractEntity } from './contract.entity';

@Entity('families')
export class FamilyEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  name!: string;

  @Column({ name: 'group_id', type: 'int' })
  @Index('IDX_FAMILIES_GROUP_ID')
  groupId!: number;

  @Column({ name: 'contract_id', type: 'varchar', length: 36 })
  @Index('IDX_FAMILIES_CONTRACT_ID')
  contractId!: string;

  @ManyToOne('ContractEntity')
  @JoinColumn({ name: 'contract_id' })
  contract!: ContractEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date | null;
}
