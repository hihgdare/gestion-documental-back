import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  ManyToMany,
  JoinColumn,
  JoinTable,
  Index,
} from 'typeorm';
import { DocumentModelEntity } from './document-model.entity';
import { ColaboratorEntity } from './colaborators.entity';
import { ContractEntity } from './contract.entity';
import { UserEntity } from './user.entity';

@Entity('documents')
export class DocumentEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'document_model_id', type: 'varchar', length: 36 })
  documentModelId!: string;

  @ManyToOne(() => DocumentModelEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'document_model_id' })
  documentModel!: DocumentModelEntity;

  @Column({ name: 'contract_id', type: 'varchar', length: 36, nullable: true })
  @Index('IDX_DOCUMENTS_CONTRACT_ID')
  contractId?: string;

  @ManyToOne(() => ContractEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'contract_id' })
  contract?: ContractEntity;

  @ManyToMany(() => ColaboratorEntity)
  @JoinTable({
    name: 'document_colaborators',
    joinColumn: { name: 'document_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'colaborator_id', referencedColumnName: 'id' },
  })
  colaborators!: ColaboratorEntity[];

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ name: 'issued_date', type: 'date', nullable: true })
  issuedDate?: Date;

  @Column({ name: 'expiration_date', type: 'date', nullable: true })
  expirationDate?: Date;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'document_url', type: 'varchar', length: 500, nullable: true })
  documentUrl?: string;

  @Column({ type: 'varchar', length: 50, default: 'draft' })
  @Index('IDX_DOCUMENTS_STATUS')
  status!: string;

  @Column({ name: 'group_id', type: 'integer' })
  @Index('IDX_DOCUMENTS_GROUP_ID')
  groupId!: number;

  @Column({ name: 'created_by', type: 'varchar', length: 36, nullable: true })
  createdBy?: string;

  @ManyToOne(() => UserEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'created_by' })
  creator?: UserEntity;

  @Column({ type: 'text', nullable: true })
  comment?: string;

  @Column({ name: 'deleted_by', type: 'varchar', length: 36, nullable: true })
  deletedBy?: string;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'deleted_by' })
  deleter?: UserEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  @Index('IDX_DOCUMENTS_DELETED_AT')
  deletedAt?: Date;
}
