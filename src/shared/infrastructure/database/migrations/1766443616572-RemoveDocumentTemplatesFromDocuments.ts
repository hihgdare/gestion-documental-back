import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey, TableIndex, Table } from "typeorm";

export class RemoveDocumentTemplatesFromDocuments1766443616572 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Add document_type_id and document_subtype_id columns to documents
    await queryRunner.addColumn('documents', new TableColumn({
      name: 'document_type_id',
      type: 'varchar',
      length: '36',
      isNullable: true, // Initially nullable to allow update
    }));

    await queryRunner.addColumn('documents', new TableColumn({
      name: 'document_subtype_id',
      type: 'varchar',
      length: '36',
      isNullable: true, // Initially nullable
    }));

    // 2. Add document_type_id and document_subtype_id columns to documents_history
    const historyTable = await queryRunner.getTable('documents_history');
    if (historyTable) {
        await queryRunner.addColumn('documents_history', new TableColumn({
        name: 'document_type_id',
        type: 'varchar',
        length: '36',
        isNullable: true,
        }));

        await queryRunner.addColumn('documents_history', new TableColumn({
        name: 'document_subtype_id',
        type: 'varchar',
        length: '36',
        isNullable: true,
        }));
    }

    // 3. Update documents with type and subtype from templates
    await queryRunner.query(`
            UPDATE documents d
            SET document_type_id = dt.document_type_id,
                document_subtype_id = dt.document_subtype_id
            FROM document_templates dt
            WHERE d.template_id = dt.id
        `);

    // 4. Update documents_history with type and subtype from templates
    if (historyTable) {
        await queryRunner.query(`
                UPDATE documents_history dh
                SET document_type_id = dt.document_type_id,
                    document_subtype_id = dt.document_subtype_id
                FROM document_templates dt
                WHERE dh.template_id = dt.id
            `);
    }

    // Make columns not nullable now if needed, but for history maybe leave nullable if some records didn't have template?
    // For documents, it was NOT NULL in original migration plan, so let's enforce it for documents where possible.
    // However, if there are documents without template_id (if it was nullable), this might fail.
    // Assuming template_id was NOT NULL in documents (it was in CreateDocumentsTable).
    
    // 5. Drop foreign key for template_id in documents
    const table = await queryRunner.getTable('documents');
    if (table) {
      const fkTemplate = table.foreignKeys.find(fk => fk.columnNames.includes('template_id'));
      if (fkTemplate) {
        await queryRunner.dropForeignKey('documents', fkTemplate);
      }
      
      // Drop index on template_id
      const idxTemplate = table.indices.find(i => i.columnNames.includes('template_id'));
      if (idxTemplate) {
        await queryRunner.dropIndex('documents', idxTemplate);
      }
      
      // Drop unique constraint
      const uqTemplate = table.indices.find(i => i.name === 'UQ_DOCUMENTS_TEMPLATE_CONTRACT_COLABORATOR');
      if (uqTemplate) {
        await queryRunner.dropIndex('documents', uqTemplate);
      }
    }

    // 6. Drop foreign key for template_id in documents_history
    if (historyTable) {
      const fkHistoryTemplate = historyTable.foreignKeys.find(fk => fk.columnNames.includes('template_id'));
      if (fkHistoryTemplate) {
        await queryRunner.dropForeignKey('documents_history', fkHistoryTemplate);
      }
    }

    // 7. Drop template_id column from documents
    await queryRunner.dropColumn('documents', 'template_id');

    // 8. Drop template_id column from documents_history
    if (historyTable) {
        await queryRunner.dropColumn('documents_history', 'template_id');
    }

    // 9. Create new indices for documents
    await queryRunner.createIndex('documents', new TableIndex({
      name: 'IDX_documents_type_subtype_contract',
      columnNames: ['document_type_id', 'document_subtype_id', 'contract_id'],
      isUnique: true,
    }));

    // 10. Add foreign keys for type and subtype in documents
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

    // 11. Add foreign keys for type and subtype in documents_history (optional, but good for integrity)
    if (historyTable) {
        await queryRunner.createForeignKey('documents_history', new TableForeignKey({
            name: 'FK_DOCUMENTS_HISTORY_DOCUMENT_TYPE',
            columnNames: ['document_type_id'],
            referencedTableName: 'document_types',
            referencedColumnNames: ['id'],
            onDelete: 'RESTRICT',
        }));

        await queryRunner.createForeignKey('documents_history', new TableForeignKey({
            name: 'FK_DOCUMENTS_HISTORY_DOCUMENT_SUBTYPE',
            columnNames: ['document_subtype_id'],
            referencedTableName: 'document_subtypes',
            referencedColumnNames: ['id'],
            onDelete: 'RESTRICT',
        }));
    }

    // 12. Drop document_templates table
    await queryRunner.dropTable('document_templates', true);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 1. Recreate document_templates table
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

    // Add FKs to document_templates
    await queryRunner.createForeignKey('document_templates', new TableForeignKey({
        name: 'FK_DOCUMENT_TEMPLATES_DOCUMENT_TYPE',
        columnNames: ['document_type_id'],
        referencedTableName: 'document_types',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
    }));
    await queryRunner.createForeignKey('document_templates', new TableForeignKey({
        name: 'FK_DOCUMENT_TEMPLATES_DOCUMENT_SUBTYPE',
        columnNames: ['document_subtype_id'],
        referencedTableName: 'document_subtypes',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
    }));

    // 2. Drop new FKs from documents
    const table = await queryRunner.getTable('documents');
    if (table) {
      const fkType = table.foreignKeys.find(fk => fk.columnNames.includes('document_type_id'));
      if (fkType) await queryRunner.dropForeignKey('documents', fkType);
      const fkSubtype = table.foreignKeys.find(fk => fk.columnNames.includes('document_subtype_id'));
      if (fkSubtype) await queryRunner.dropForeignKey('documents', fkSubtype);
    }

    // Drop new FKs from documents_history
    const historyTable = await queryRunner.getTable('documents_history');
    if (historyTable) {
        const fkType = historyTable.foreignKeys.find(fk => fk.columnNames.includes('document_type_id'));
        if (fkType) await queryRunner.dropForeignKey('documents_history', fkType);
        const fkSubtype = historyTable.foreignKeys.find(fk => fk.columnNames.includes('document_subtype_id'));
        if (fkSubtype) await queryRunner.dropForeignKey('documents_history', fkSubtype);
    }

    // 3. Drop new index from documents
    if (table && table.indices.find(i => i.name === 'IDX_documents_type_subtype_contract')) {
      await queryRunner.dropIndex('documents', 'IDX_documents_type_subtype_contract');
    }

    // 4. Add template_id column back to documents
    await queryRunner.addColumn('documents', new TableColumn({
      name: 'template_id',
      type: 'varchar',
      length: '36',
      isNullable: true, // Initially nullable
    }));

    // Add template_id column back to documents_history
    if (historyTable) {
        await queryRunner.addColumn('documents_history', new TableColumn({
            name: 'template_id',
            type: 'varchar',
            length: '36',
            isNullable: true,
        }));
    }

    // 5. Restore templates data (Create templates for unique type-subtype combinations)
    await queryRunner.query(`
            INSERT INTO document_templates (id, name, document_type_id, document_subtype_id, created_at, updated_at)
            SELECT
                gen_random_uuid() as id,
                CONCAT(dt.name, '_', dst.name, '_', NOW()::text) as name,
                d.document_type_id,
                d.document_subtype_id,
                NOW() as created_at,
                NOW() as updated_at
            FROM (
                SELECT DISTINCT document_type_id, document_subtype_id
                FROM documents
                WHERE document_type_id IS NOT NULL AND document_subtype_id IS NOT NULL
            ) d
            JOIN document_types dt ON d.document_type_id = dt.id
            JOIN document_subtypes dst ON d.document_subtype_id = dst.id
        `);

    // 6. Update documents with template_id
    await queryRunner.query(`
            UPDATE documents d
            SET template_id = dt.id
            FROM document_templates dt
            WHERE d.document_type_id = dt.document_type_id
                AND d.document_subtype_id = dt.document_subtype_id
        `);
    
    // Update documents_history with template_id
    await queryRunner.query(`
            UPDATE documents_history dh
            SET template_id = dt.id
            FROM document_templates dt
            WHERE dh.document_type_id = dt.document_type_id
                AND dh.document_subtype_id = dt.document_subtype_id
        `);

    // 7. Drop columns type/subtype
    await queryRunner.dropColumn('documents', 'document_type_id');
    await queryRunner.dropColumn('documents', 'document_subtype_id');
    if (historyTable) {
        await queryRunner.dropColumn('documents_history', 'document_type_id');
        await queryRunner.dropColumn('documents_history', 'document_subtype_id');
    }

    // 8. Add foreign key for template_id in documents
    await queryRunner.createForeignKey('documents', new TableForeignKey({
      name: 'FK_DOCUMENTS_TEMPLATE',
      columnNames: ['template_id'],
      referencedTableName: 'document_templates',
      referencedColumnNames: ['id'],
      onDelete: 'RESTRICT',
    }));

    // Add foreign key for template_id in documents_history
    if (historyTable) {
        await queryRunner.createForeignKey('documents_history', new TableForeignKey({
            name: 'FK_DOCUMENTS_HISTORY_TEMPLATE',
            columnNames: ['template_id'],
            referencedTableName: 'document_templates',
            referencedColumnNames: ['id'],
            onDelete: 'RESTRICT',
        }));
    }

    // 9. Add indices
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
