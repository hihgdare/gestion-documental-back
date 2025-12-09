import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { DocumentTemplateEntity } from './document-template.entity';
import { ContractEntity } from './contract.entity';
import { ColaboratorEntity } from './colaborators.entity';
import { UserEntity } from './user.entity';

@Entity('documents')
@Index(['templateId', 'colaboratorId'], { unique: true })
@Index(['contractId'])
@Index(['status'])
@Index(['deletedAt'])
export class DocumentEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'template_id', type: 'varchar', length: 36 })
  templateId!: string;

  @ManyToOne(() => DocumentTemplateEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'template_id' })
  template!: DocumentTemplateEntity;

  @Column({ name: 'colaborator_id', type: 'varchar', length: 36 })
  colaboratorId!: string;

  @ManyToOne(() => ColaboratorEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'colaborator_id' })
  colaborator!: ColaboratorEntity;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ name: 'issued_date', type: 'date' })
  issuedDate!: Date;

  @Column({ name: 'expiration_date', type: 'date', nullable: true })
  expirationDate?: Date;

  @Column({ name: 'contract_id', type: 'varchar', length: 36, nullable: true })
  contractId?: string;

  @ManyToOne(() => ContractEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'contract_id' })
  contract?: ContractEntity;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'document_url', type: 'varchar', length: 500, nullable: true })
  documentUrl?: string;

  @Column({ type: 'varchar', length: 50, default: 'draft' })
  status!: string;

  @Column({ name: 'created_by', type: 'varchar', length: 36, nullable: true })
  createdBy?: string;

  @ManyToOne(() => UserEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'created_by' })
  creator?: UserEntity;

  @Column({ type: 'text', nullable: true })
  comment?: string;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date;

  @Column({ name: 'deleted_by', type: 'varchar', length: 36, nullable: true })
  deletedBy?: string;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'deleted_by' })
  deleter?: UserEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
