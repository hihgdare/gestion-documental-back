import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { FamilyEntity } from './family.entity';
import { DocumentTypeEntity } from './document-type.entity';
import { DocumentSubtypeEntity } from './document-subtype.entity';

@Entity('document_models')
export class DocumentModelEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'family_id', type: 'varchar', length: 36 })
  familyId!: string;

  @Column({ name: 'document_type_id', type: 'varchar', length: 36 })
  documentTypeId!: string;

  @Column({ name: 'document_subtype_id', type: 'varchar', length: 36 })
  documentSubtypeId!: string;

  @Column({ name: 'required_for_contract', type: 'boolean', default: false })
  requiredForContract!: boolean;

  @Column({ name: 'required_for_colaborator', type: 'boolean', default: false })
  requiredForColaborator!: boolean;

  @ManyToOne(() => FamilyEntity)
  @JoinColumn({ name: 'family_id' })
  family?: FamilyEntity;

  @ManyToOne(() => DocumentTypeEntity)
  @JoinColumn({ name: 'document_type_id' })
  documentType?: DocumentTypeEntity;

  @ManyToOne(() => DocumentSubtypeEntity)
  @JoinColumn({ name: 'document_subtype_id' })
  documentSubtype?: DocumentSubtypeEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt!: Date | null;
}
