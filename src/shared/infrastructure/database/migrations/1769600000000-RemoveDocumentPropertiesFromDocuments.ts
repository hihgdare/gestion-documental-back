import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class RemoveDocumentPropertiesFromDocuments1769600000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Remove document_type_id and document_subtype_id columns from documents table
    await queryRunner.getTable('documents').then(async (table) => {
      if (table?.columns.find((col) => col.name === 'document_type_id')) {
        // Drop foreign key first if exists
        const fkType = table.foreignKeys.find((fk) => fk.columnNames.includes('document_type_id'));
        if (fkType) {
          await queryRunner.dropForeignKey('documents', fkType);
        }
        await queryRunner.dropColumn('documents', 'document_type_id');
      }
      if (table?.columns.find((col) => col.name === 'document_subtype_id')) {
        // Drop foreign key first if exists
        const fkSubtype = table.foreignKeys.find((fk) => fk.columnNames.includes('document_subtype_id'));
        if (fkSubtype) {
          await queryRunner.dropForeignKey('documents', fkSubtype);
        }
        await queryRunner.dropColumn('documents', 'document_subtype_id');
      }
    });

    // Remove document_type_id and document_subtype_id columns from documents_history table
    await queryRunner.getTable('documents_history').then(async (table) => {
      if (table?.columns.find((col) => col.name === 'document_type_id')) {
        // Drop foreign key first if exists
        const fkType = table.foreignKeys.find((fk) => fk.columnNames.includes('document_type_id'));
        if (fkType) {
          await queryRunner.dropForeignKey('documents_history', fkType);
        }
        await queryRunner.dropColumn('documents_history', 'document_type_id');
      }
      if (table?.columns.find((col) => col.name === 'document_subtype_id')) {
        // Drop foreign key first if exists
        const fkSubtype = table.foreignKeys.find((fk) => fk.columnNames.includes('document_subtype_id'));
        if (fkSubtype) {
          await queryRunner.dropForeignKey('documents_history', fkSubtype);
        }
        await queryRunner.dropColumn('documents_history', 'document_subtype_id');
      }
    });

    // Drop the unique index that includes these columns
    const docsTable = await queryRunner.getTable('documents');
    if (docsTable?.indices.find((i) => i.name === 'IDX_documents_type_subtype_contract')) {
      await queryRunner.dropIndex('documents', 'IDX_documents_type_subtype_contract');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Recreate columns in documents table
    let table = await queryRunner.getTable('documents');

    if (!table?.columns.find((col) => col.name === 'document_type_id')) {
      await queryRunner.addColumn('documents', new TableColumn({
        name: 'document_type_id',
        type: 'varchar',
        length: '36',
        isNullable: true,
      }));
    }

    if (!table?.columns.find((col) => col.name === 'document_subtype_id')) {
      await queryRunner.addColumn('documents', new TableColumn({
        name: 'document_subtype_id',
        type: 'varchar',
        length: '36',
        isNullable: true,
      }));
    }

    // Recreate columns in documents_history table
    table = await queryRunner.getTable('documents_history');

    if (table && !table.columns.find((col) => col.name === 'document_type_id')) {
      await queryRunner.addColumn('documents_history', new TableColumn({
        name: 'document_type_id',
        type: 'varchar',
        length: '36',
        isNullable: true,
      }));
    }

    if (table && !table.columns.find((col) => col.name === 'document_subtype_id')) {
      await queryRunner.addColumn('documents_history', new TableColumn({
        name: 'document_subtype_id',
        type: 'varchar',
        length: '36',
        isNullable: true,
      }));
    }
  }
}
