import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateDocumentSubtypesTable1762377519901 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
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
          {
            name: 'IDX_DOCUMENT_SUBTYPES_DOCUMENT_TYPE_ID',
            columnNames: ['document_type_id'],
          },
          {
            name: 'IDX_DOCUMENT_SUBTYPES_NAME_DOCUMENT_TYPE_ID',
            columnNames: ['name', 'document_type_id'],
            isUnique: true,
          },
        ],
      }),
      true,
    );

    // Add foreign key constraint
    await queryRunner.createForeignKey(
      'document_subtypes',
      new TableForeignKey({
        columnNames: ['document_type_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'document_types',
        onDelete: 'CASCADE',
        name: 'FK_DOCUMENT_SUBTYPES_DOCUMENT_TYPE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('document_subtypes');
    if (table) {
      const fk = table.foreignKeys.find(f => f.name === 'FK_DOCUMENT_SUBTYPES_DOCUMENT_TYPE' || f.columnNames.includes('document_type_id'));
      if (fk) {
        await queryRunner.dropForeignKey('document_subtypes', fk);
      }
    }
    if (await queryRunner.getTable('document_subtypes')) {
      await queryRunner.dropTable('document_subtypes');
    }
  }
}
