import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { DocumentEntity } from './document.entity';
import { DocumentTypeEntity } from './document-type.entity';
import { DocumentSubtypeEntity } from './document-subtype.entity';
import { ContractEntity } from './contract.entity';
import { UserEntity } from './user.entity';

@Entity('documents_history')
@Index('IDX_documents_history_document', ['documentId'])
@Index('IDX_documents_history_action', ['action'])
@Index('IDX_documents_history_updated_by', ['updatedBy'])
@Index('IDX_documents_history_status', ['status'])
export class DocumentHistoryEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'document_id', type: 'varchar', length: 36 })
  documentId!: string;

  @ManyToOne(() => DocumentEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'document_id' })
  document!: DocumentEntity;

  @Column({ name: 'document_type_id', type: 'varchar', length: 36 })
  documentTypeId!: string;

  @ManyToOne(() => DocumentTypeEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'document_type_id' })
  documentType!: DocumentTypeEntity;

  @Column({ name: 'document_subtype_id', type: 'varchar', length: 36 })
  documentSubtypeId!: string;

  @ManyToOne(() => DocumentSubtypeEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'document_subtype_id' })
  documentSubtype!: DocumentSubtypeEntity;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ name: 'issued_date', type: 'date', nullable: true })
  issuedDate?: Date;

  @Column({ name: 'expiration_date', type: 'date', nullable: true })
  expirationDate?: Date;

  @Column({ name: 'contract_id', type: 'varchar', length: 36, nullable: true })
  contractId?: string;

  @ManyToOne(() => ContractEntity, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'contract_id' })
  contract?: ContractEntity;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'document_url', type: 'varchar', length: 500, nullable: true })
  documentUrl?: string;

  @Column({ type: 'varchar', length: 50 })
  status!: string;

  @Column({ type: 'text', nullable: true })
  comment?: string;

  @Column({ type: 'varchar', length: 50 })
  action!: string;

  @Column({ name: 'updated_by', type: 'varchar', length: 36, nullable: true })
  updatedBy?: string;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'updated_by' })
  updater?: UserEntity;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
