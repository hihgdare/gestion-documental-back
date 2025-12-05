import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('contract_templates')
@Index(['contractId'])
@Index(['documentTemplateId'])
export class ContractTemplateEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'contract_id', type: 'varchar', length: 36 })
  contractId!: string;

  @Column({ name: 'document_template_id', type: 'varchar', length: 36 })
  documentTemplateId!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
