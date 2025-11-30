import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

export class RemoveContractRelationFromDocuments1764541000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys and indices referencing contract_id in documents
    const documentsTable = await queryRunner.getTable('documents');
    if (documentsTable) {
      // Drop FKs on contract_id if any
      for (const fk of documentsTable.foreignKeys) {
        if (fk.columnNames.includes('contract_id')) {
          await queryRunner.dropForeignKey('documents', fk);
        }
      }
      // Drop indices on contract_id if any
      for (const idx of documentsTable.indices) {
        if (idx.columnNames.includes('contract_id')) {
          await queryRunner.dropIndex('documents', idx);
        }
      }
      // Drop column contract_id if exists
      const hasContractId = documentsTable.columns.find((c) => c.name === 'contract_id');
      if (hasContractId) {
        await queryRunner.dropColumn('documents', 'contract_id');
      }
    }

    // Drop contract_id and FK from documents_history
    const historyTable = await queryRunner.getTable('documents_history');
    if (historyTable) {
      // Drop FK on contract_id
      for (const fk of historyTable.foreignKeys) {
        if (fk.columnNames.includes('contract_id')) {
          await queryRunner.dropForeignKey('documents_history', fk);
        }
      }
      // Drop indices on contract_id if any
      for (const idx of historyTable.indices) {
        if (idx.columnNames.includes('contract_id')) {
          await queryRunner.dropIndex('documents_history', idx);
        }
      }
      // Drop column
      const hasContractId = historyTable.columns.find((c) => c.name === 'contract_id');
      if (hasContractId) {
        await queryRunner.dropColumn('documents_history', 'contract_id');
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Recreate contract_id column in documents (nullable)
    const documentsTable = await queryRunner.getTable('documents');
    if (documentsTable && !documentsTable.columns.find((c) => c.name === 'contract_id')) {
      await queryRunner.addColumn(
        'documents',
        new TableColumn({ name: 'contract_id', type: 'varchar', length: '36', isNullable: true }),
      );
    }

    // Recreate contract_id column and FK in documents_history (nullable)
    const historyTable = await queryRunner.getTable('documents_history');
    if (historyTable && !historyTable.columns.find((c) => c.name === 'contract_id')) {
      await queryRunner.addColumn(
        'documents_history',
        new TableColumn({ name: 'contract_id', type: 'varchar', length: '36', isNullable: true }),
      );
      await queryRunner.createForeignKey(
        'documents_history',
        new TableForeignKey({
          name: 'FK_DOCUMENTS_HISTORY_CONTRACT',
          columnNames: ['contract_id'],
          referencedTableName: 'contracts',
          referencedColumnNames: ['id'],
          onDelete: 'SET NULL',
          onUpdate: 'CASCADE',
        }),
      );
    }
  }
}
