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
import { DocumentTypeEntity } from './document-type.entity';
import { DocumentSubtypeEntity } from './document-subtype.entity';
import { ContractEntity } from './contract.entity';
import { DateUtils } from '@shared/utils/common';

@Entity('documents')
@Index(['contractId'])
@Index(['documentTypeId'])
@Index(['documentSubtypeId'])
export class DocumentEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

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

  @Column({ name: 'issued_date', type: 'date' })
  issuedDate!: Date;

  @Column({ name: 'expiration_date', type: 'date', nullable: true })
  expirationDate?: Date;

  @Column({ name: 'contract_id', type: 'varchar', length: 36 })
  contractId!: string;

  @ManyToOne(() => ContractEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'contract_id' })
  contract!: ContractEntity;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'document_url', type: 'varchar', length: 500, nullable: true })
  documentUrl?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
