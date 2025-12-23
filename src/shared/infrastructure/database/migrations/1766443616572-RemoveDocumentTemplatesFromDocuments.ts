import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey, TableIndex } from "typeorm";

export class RemoveDocumentTemplatesFromDocuments1766443616572 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add document_type_id column
    await queryRunner.addColumn('documents', new TableColumn({
      name: 'document_type_id',
      type: 'varchar',
      length: '36',
      isNullable: false,
    }));

    // Add document_subtype_id column
    await queryRunner.addColumn('documents', new TableColumn({
      name: 'document_subtype_id',
      type: 'varchar',
      length: '36',
      isNullable: false,
    }));

    // Update documents with type and subtype from templates
    await queryRunner.query(`
            UPDATE documents d
            SET document_type_id = dt.document_type_id,
                document_subtype_id = dt.document_subtype_id
            FROM document_templates dt
            WHERE d.template_id = dt.id
        `);

    // Drop foreign key for template_id
    const table = await queryRunner.getTable('documents');
    if (table) {
      const fkTemplate = table.foreignKeys.find(fk => fk.columnNames.includes('template_id'));
      if (fkTemplate) {
        await queryRunner.dropForeignKey('documents', fkTemplate);
      }
    }

    // Drop index on template_id
    if (table && table.indices.find(i => i.columnNames.includes('template_id'))) {
      await queryRunner.dropIndex('documents', 'IDX_DOCUMENTS_TEMPLATE_ID');
    }

    // Drop unique constraint
    if (table && table.indices.find(i => i.name === 'UQ_DOCUMENTS_TEMPLATE_CONTRACT_COLABORATOR')) {
      await queryRunner.dropIndex('documents', 'UQ_DOCUMENTS_TEMPLATE_CONTRACT_COLABORATOR');
    }

    // Drop template_id column
    await queryRunner.dropColumn('documents', 'template_id');

    // Create new indices
    await queryRunner.createIndex('documents', new TableIndex({
      name: 'IDX_documents_type_subtype_contract',
      columnNames: ['document_type_id', 'document_subtype_id', 'contract_id'],
      isUnique: true,
    }));

    // Add foreign keys for type and subtype
    await queryRunner.createForeignKey('documents', new TableForeignKey({
      name: 'FK_DOCUMENTS_DOCUMENT_TYPE',
      columnNames: ['document_type_id'],
      referencedTableName: 'document_types',
      referencedColumnNames: ['id'],
      onDelete: 'RESTRICT',
    }));

    await queryRunner.createForeignKey('documents', new TableForeignKey({
      name: 'FK_DOCUMENTS_DOCUMENT_SUBTYPE',
      columnNames: ['document_subtype_id'],
      referencedTableName: 'document_subtypes',
      referencedColumnNames: ['id'],
      onDelete: 'RESTRICT',
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys
    const table = await queryRunner.getTable('documents');
    if (table) {
      const fkType = table.foreignKeys.find(fk => fk.columnNames.includes('document_type_id'));
      if (fkType) await queryRunner.dropForeignKey('documents', fkType);
      const fkSubtype = table.foreignKeys.find(fk => fk.columnNames.includes('document_subtype_id'));
      if (fkSubtype) await queryRunner.dropForeignKey('documents', fkSubtype);
    }

    // Drop new index
    if (table && table.indices.find(i => i.name === 'IDX_documents_type_subtype_contract')) {
      await queryRunner.dropIndex('documents', 'IDX_documents_type_subtype_contract');
    }

    // Add template_id column
    await queryRunner.addColumn('documents', new TableColumn({
      name: 'template_id',
      type: 'varchar',
      length: '36',
      isNullable: false,
    }));

    // Create templates for unique type-subtype combinations if they don't exist
    await queryRunner.query(`
            INSERT INTO document_templates (id, name, document_type_id, document_subtype_id, created_at, updated_at)
            SELECT
                gen_random_uuid() as id,
                CONCAT(dt.name, '_', dst.name, '_', NOW()::text) as name,
                dt.id as document_type_id,
                dst.id as document_subtype_id,
                NOW() as created_at,
                NOW() as updated_at
            FROM (
                SELECT DISTINCT document_type_id, document_subtype_id
                FROM documents
                WHERE document_type_id IS NOT NULL AND document_subtype_id IS NOT NULL
            ) d
            JOIN document_types dt ON d.document_type_id = dt.id
            JOIN document_subtypes dst ON d.document_subtype_id = dst.id
            LEFT JOIN document_templates existing ON existing.document_type_id = d.document_type_id
                AND existing.document_subtype_id = d.document_subtype_id
            WHERE existing.id IS NULL
        `);

    // Update documents with template_id
    await queryRunner.query(`
            UPDATE documents d
            SET template_id = dt.id
            FROM document_templates dt
            WHERE d.document_type_id = dt.document_type_id
                AND d.document_subtype_id = dt.document_subtype_id
        `);

    // Drop columns
    await queryRunner.dropColumn('documents', 'document_type_id');
    await queryRunner.dropColumn('documents', 'document_subtype_id');

    // Add foreign key for template_id
    await queryRunner.createForeignKey('documents', new TableForeignKey({
      name: 'FK_DOCUMENTS_TEMPLATE',
      columnNames: ['template_id'],
      referencedTableName: 'document_templates',
      referencedColumnNames: ['id'],
      onDelete: 'RESTRICT',
    }));

    // Add indices
    await queryRunner.createIndex('documents', new TableIndex({
      name: 'IDX_DOCUMENTS_TEMPLATE_ID',
      columnNames: ['template_id'],
    }));

    await queryRunner.createIndex('documents', new TableIndex({
      name: 'UQ_DOCUMENTS_TEMPLATE_CONTRACT_COLABORATOR',
      columnNames: ['template_id', 'contract_id', 'colaborator_id'],
      isUnique: true,
    }));
  }

}
