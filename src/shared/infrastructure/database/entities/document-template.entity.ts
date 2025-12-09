import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { DocumentTypeEntity } from './document-type.entity';
import { DocumentSubtypeEntity } from './document-subtype.entity';

@Entity('document_templates')
@Index(['documentTypeId'])
@Index(['documentSubtypeId'])
export class DocumentTemplateEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

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

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
