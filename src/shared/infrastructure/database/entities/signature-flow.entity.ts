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
import { DocumentEntity } from './document.entity';
import { UserEntity } from './user.entity';
import { EnumColumn } from './utils/decorators';
import { SignatureFlowOrderType, SignatureFlowStatus } from '@domains/signature-flow/value-objects/signature-flow-enums';

@Entity('signature_flows')
@Index('IDX_signature_flows_document_id', ['documentId'])
@Index('IDX_signature_flows_status', ['status'])
export class SignatureFlowEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'document_id', type: 'varchar', length: 36 })
  documentId!: string;

  @ManyToOne(() => DocumentEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'document_id' })
  document!: DocumentEntity;

  @EnumColumn({
    name: 'order_type',
    enum: Object.values(SignatureFlowOrderType),
    default: SignatureFlowOrderType.SEQUENTIAL,
  })
  orderType!: string;

  @EnumColumn({
    name: 'status',
    enum: Object.values(SignatureFlowStatus),
    default: SignatureFlowStatus.DRAFT,
  })
  status!: string;

  @Column({ name: 'sent_at', type: 'timestamp', nullable: true })
  sentAt?: Date;

  @Column({ name: 'sent_by', type: 'varchar', length: 36, nullable: true })
  sentBy?: string;

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'sent_by' })
  sentByUser?: UserEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
