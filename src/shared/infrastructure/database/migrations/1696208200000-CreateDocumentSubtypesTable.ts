import { Table } from 'typeorm';
import { ImprovedRunner, IQueryRunner } from '../runner';

export class CreateDocumentSubtypesTable1696208200000 extends ImprovedRunner {

  public async onUp(queryRunner: IQueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'document_subtypes',
      columns: [
        {
          name: 'id',
          type: 'varchar',
          length: '36',
          isPrimary: true,
          generationStrategy: 'uuid',
        },
        {
          name: 'name',
          type: 'varchar',
          length: '100',
          isNullable: false,
        },
        {
          name: 'document_type_id',
          type: 'varchar',
          length: '36',
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
      ],
      indices: [
        { name: 'IDX_DOCUMENT_SUBTYPES_DOCUMENT_TYPE_ID', columnNames: ['document_type_id'] },
        { name: 'IDX_DOCUMENT_SUBTYPES_NAME_DOCUMENT_TYPE_ID', columnNames: ['name', 'document_type_id'], isUnique: true },
      ],
      foreignKeys: [
        {
          name: 'FK_DOCUMENT_SUBTYPES_DOCUMENT_TYPE',
          columnNames: ['document_type_id'],
          referencedColumnNames: ['id'],
          referencedTableName: 'document_types',
          onDelete: 'CASCADE',
        },
      ],
    }));
  }

  public async onDown(queryRunner: IQueryRunner): Promise<void> {
    await queryRunner.dropTable('document_subtypes');
  }

}
