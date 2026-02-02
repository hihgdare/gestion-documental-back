import { Table } from 'typeorm';
import { ImprovedRunner, IQueryRunner } from '../runner';

export class CreateDocumentModelsTable1696208300000 extends ImprovedRunner {

  public async onUp(queryRunner: IQueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'document_models',
      columns: [
        {
          name: 'id',
          type: 'varchar',
          length: '36',
          isPrimary: true,
          generationStrategy: 'uuid',
        },
        {
          name: 'family_id',
          type: 'varchar',
          length: '36',
          isNullable: false,
        },
        {
          name: 'document_type_id',
          type: 'varchar',
          length: '36',
          isNullable: false,
        },
        {
          name: 'document_subtype_id',
          type: 'varchar',
          length: '36',
          isNullable: false,
        },
        {
          name: 'required_expiration_date',
          type: 'boolean',
          isNullable: false,
          default: false,
        },
        {
          name: 'required_for_contract',
          type: 'boolean',
          isNullable: false,
          default: false,
        },
        {
          name: 'required_for_colaborator',
          type: 'boolean',
          isNullable: false,
          default: false,
        },
        {
          name: 'group_id',
          type: 'int',
          isNullable: false,
        },
        {
          name: 'created_at',
          type: 'timestamp',
          default: 'CURRENT_TIMESTAMP',
          isNullable: false,
        },
        {
          name: 'updated_at',
          type: 'timestamp',
          default: 'CURRENT_TIMESTAMP',
          onUpdate: 'CURRENT_TIMESTAMP',
          isNullable: false,
        },
        {
          name: 'deleted_at',
          type: 'timestamp',
          isNullable: true,
          default: null,
        },
      ],
      indices: [
        { name: 'IDX_DOCUMENT_MODELS_FAMILY_ID', columnNames: ['family_id'] },
        { name: 'IDX_DOCUMENT_MODELS_TYPE_SUBTYPE', columnNames: ['document_type_id', 'document_subtype_id'] },
      ],
      foreignKeys: [
        {
          name: 'FK_DOCUMENT_MODELS_FAMILY',
          columnNames: ['family_id'],
          referencedColumnNames: ['id'],
          referencedTableName: 'families',
          onDelete: 'CASCADE',
        },
        {
          name: 'FK_DOCUMENT_MODELS_TYPE',
          columnNames: ['document_type_id'],
          referencedColumnNames: ['id'],
          referencedTableName: 'document_types',
          onDelete: 'RESTRICT',
        },
        {
          name: 'FK_DOCUMENT_MODELS_SUBTYPE',
          columnNames: ['document_subtype_id'],
          referencedColumnNames: ['id'],
          referencedTableName: 'document_subtypes',
          onDelete: 'RESTRICT',
        },
        {
          name: 'FK_DOCUMENT_MODELS_GROUP',
          columnNames: ['group_id'],
          referencedColumnNames: ['id'],
          referencedTableName: 'groups',
          onDelete: 'CASCADE',
        },
      ],
    }));
  }

  public async onDown(queryRunner: IQueryRunner): Promise<void> {
    await queryRunner.dropTable('document_models');
  }

}
