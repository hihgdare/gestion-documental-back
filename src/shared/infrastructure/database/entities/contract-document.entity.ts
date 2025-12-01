import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ContractEntity } from './contract.entity';
import { DocumentEntity } from './document.entity';

@Entity('contract_documents')
@Index(['contractId', 'documentId'], { unique: true })
export class ContractDocumentEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'contract_id', type: 'varchar', length: 36 })
  contractId!: string;

  @ManyToOne(() => ContractEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'contract_id' })
  contract!: ContractEntity;

  @Column({ name: 'document_id', type: 'varchar', length: 36 })
  documentId!: string;

  @ManyToOne(() => DocumentEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'document_id' })
  document!: DocumentEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
