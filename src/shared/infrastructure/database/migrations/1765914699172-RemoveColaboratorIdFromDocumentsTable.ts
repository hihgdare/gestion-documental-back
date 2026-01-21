import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey, TableIndex } from 'typeorm';

export class RemoveColaboratorIdFromDocumentsTable1765914699172 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop the old unique index that included colaboratorId
    await queryRunner.dropIndex('documents', 'UQ_DOCUMENTS_TEMPLATE_CONTRACT_COLABORATOR');

    // Drop the foreign key constraint for colaboratorId
    await queryRunner.dropForeignKey('documents', 'FK_DOCUMENTS_COLABORATOR');

    // Drop the colaboratorId column
    await queryRunner.dropColumn('documents', 'colaborator_id');

    // Add a new unique index without colaboratorId (if needed for template + contract combo)
    await queryRunner.createIndex(
      'documents',
      new TableIndex({
        name: 'UQ_documents_template_contract',
        columnNames: ['template_id', 'contract_id'],
        isUnique: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the new unique index (check if exists first)
    const table = await queryRunner.getTable('documents');
    if (table && table.indices.find((i) => i.name === 'UQ_documents_template_contract')) {
      await queryRunner.dropIndex('documents', 'UQ_documents_template_contract');
    }

    // Add back the colaboratorId column
    await queryRunner.addColumn(
      'documents',
      new TableColumn({
        name: 'colaborator_id',
        type: 'varchar',
        length: '36',
        isNullable: false,
      }),
    );

    // Add back the foreign key constraint
    await queryRunner.createForeignKey(
      'documents',
      new TableForeignKey({
        name: 'FK_DOCUMENTS_COLABORATOR',
        columnNames: ['colaborator_id'],
        referencedTableName: 'colaborators',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      }),
    );

    // Restore the old unique index
    await queryRunner.createIndex(
      'documents',
      new TableIndex({
        name: 'UQ_DOCUMENTS_TEMPLATE_CONTRACT_COLABORATOR',
        columnNames: ['template_id', 'contract_id', 'colaborator_id'],
        isUnique: true,
      }),
    );
  }
}
