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
import { DocumentTypeEntity } from './document-type.entity';
import { DocumentSubtypeEntity } from './document-subtype.entity';
import { ContractEntity } from './contract.entity';
import { ColaboratorEntity } from './colaborators.entity';
import { UserEntity } from './user.entity';

@Entity('documents')
@Index('IDX_documents_status', ['status'])
@Index('IDX_documents_deleted_at', ['deletedAt'])
@Index('IDX_documents_group_id', ['groupId'])
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

  @Column({ name: 'required_for_contract', type: 'boolean', default: false })
  requiredForContract!: boolean;

  @Column({ name: 'required_for_colaborator', type: 'boolean', default: false })
  requiredForColaborator!: boolean;

  @Column({ name: 'group_id', type: 'integer' })
  groupId!: number;

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
