import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateDocumentTemplatesTable1762378000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'document_templates',
        columns: [
          { name: 'id', type: 'varchar', length: '36', isPrimary: true },
          { name: 'name', type: 'varchar', length: '255', isNullable: false },
          { name: 'description', type: 'text', isNullable: true },
          { name: 'document_type_id', type: 'varchar', length: '36', isNullable: false },
          { name: 'document_subtype_id', type: 'varchar', length: '36', isNullable: false },
          { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP', isNullable: false },
          { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP', isNullable: false },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'document_templates',
      new TableForeignKey({
        name: 'FK_DOCUMENT_TEMPLATES_DOCUMENT_TYPE',
        columnNames: ['document_type_id'],
        referencedTableName: 'document_types',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'document_templates',
      new TableForeignKey({
        name: 'FK_DOCUMENT_TEMPLATES_DOCUMENT_SUBTYPE',
        columnNames: ['document_subtype_id'],
        referencedTableName: 'document_subtypes',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      }),
    );

    await queryRunner.createIndex(
      'document_templates',
      new TableIndex({ name: 'IDX_DOCUMENT_TEMPLATES_DOCUMENT_TYPE', columnNames: ['document_type_id'] }),
    );

    await queryRunner.createIndex(
      'document_templates',
      new TableIndex({ name: 'IDX_DOCUMENT_TEMPLATES_DOCUMENT_SUBTYPE', columnNames: ['document_subtype_id'] }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('document_templates');
    if (table) {
      const fkSubtype = table.foreignKeys.find(f => f.name === 'FK_DOCUMENT_TEMPLATES_DOCUMENT_SUBTYPE' || f.columnNames.includes('document_subtype_id'));
      if (fkSubtype) {
        await queryRunner.dropForeignKey('document_templates', fkSubtype);
      }
      const fkType = table.foreignKeys.find(f => f.name === 'FK_DOCUMENT_TEMPLATES_DOCUMENT_TYPE' || f.columnNames.includes('document_type_id'));
      if (fkType) {
        await queryRunner.dropForeignKey('document_templates', fkType);
      }
      const hasIdxSubtype = table.indices.some(i => i.name === 'IDX_DOCUMENT_TEMPLATES_DOCUMENT_SUBTYPE');
      if (hasIdxSubtype) {
        await queryRunner.dropIndex('document_templates', 'IDX_DOCUMENT_TEMPLATES_DOCUMENT_SUBTYPE');
      }
      const hasIdxType = table.indices.some(i => i.name === 'IDX_DOCUMENT_TEMPLATES_DOCUMENT_TYPE');
      if (hasIdxType) {
        await queryRunner.dropIndex('document_templates', 'IDX_DOCUMENT_TEMPLATES_DOCUMENT_TYPE');
      }
    }
    // Drop referencing FKs from other tables if present
    const documents = await queryRunner.getTable('documents');
    if (documents) {
      const fkDocsTemplate = documents.foreignKeys.find(f => f.columnNames.includes('template_id') && f.referencedTableName === 'document_templates');
      if (fkDocsTemplate) {
        await queryRunner.dropForeignKey('documents', fkDocsTemplate);
      }
    }
    const docsHistory = await queryRunner.getTable('documents_history');
    if (docsHistory) {
      const fkHistTemplate = docsHistory.foreignKeys.find(f => f.columnNames.includes('template_id') && f.referencedTableName === 'document_templates');
      if (fkHistTemplate) {
        await queryRunner.dropForeignKey('documents_history', fkHistTemplate);
      }
    }
    // Fallback explicit names
    await queryRunner.dropForeignKey('documents_history', 'FK_DOCUMENTS_HISTORY_TEMPLATE').catch(() => { });
    await queryRunner.dropForeignKey('documents', 'FK_DOCUMENTS_TEMPLATE').catch(() => { });
    if (await queryRunner.getTable('document_templates')) {
      await queryRunner.dropTable('document_templates');
    }
  }
}
