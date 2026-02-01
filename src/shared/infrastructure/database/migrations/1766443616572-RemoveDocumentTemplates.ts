import { Table, TableColumn, TableForeignKey, TableIndex } from "typeorm";
import { ImprovedRunner, IQueryRunner } from "../runner";

export class RemoveDocumentTemplates1766443616572 extends ImprovedRunner {

  public async onUp(queryRunner: IQueryRunner): Promise<void> {
    // 1.1. Add document_type_id and document_subtype_id columns to documents
    if (!(await queryRunner.hasColumn('documents', 'document_type_id'))) {
      await queryRunner.addColumn('documents', new TableColumn({
        name: 'document_type_id',
        type: 'varchar',
        length: '36',
        isNullable: true, // Initially nullable to allow update
      }));
    }
    if (!(await queryRunner.hasColumn('documents', 'document_subtype_id'))) {
      await queryRunner.addColumn('documents', new TableColumn({
        name: 'document_subtype_id',
        type: 'varchar',
        length: '36',
        isNullable: true, // Initially nullable
      }));
    }

    // 1.2. Update documents with type and subtype from templates
    // Only run update if template_id still exists (meaning we haven't migrated yet)
    if (await queryRunner.hasColumn('documents', 'template_id')) {
      await queryRunner.query(`
        UPDATE documents d
        INNER JOIN document_templates dt ON d.template_id = dt.id
        SET d.document_type_id = dt.document_type_id,
            d.document_subtype_id = dt.document_subtype_id
      `);
    }

    // 1.3. Drop template_id column with foreign keys and indexes
    await queryRunner.dropColumn('documents', 'template_id');

    // 1.4. Make both ids not nullable
    // We check if we need to change column (e.g. if it is nullable)
    // But changeColumn is usually safe enough or we can just run it.
    // However, if we want to be safe:
    if (await queryRunner.isNullable('documents', 'document_type_id')) {
      await queryRunner.changeColumn('documents', new TableColumn({
        name: 'document_type_id',
        type: 'varchar',
        length: '36',
        isNullable: false,
      }));
    }
    if (await queryRunner.isNullable('documents', 'document_subtype_id')) {
      await queryRunner.changeColumn('documents', new TableColumn({
        name: 'document_subtype_id',
        type: 'varchar',
        length: '36',
        isNullable: false,
      }));
    }

    // 1.5. Add foreign keys for type and subtype in documents
    if (!(await queryRunner.hasForeignKey('documents', 'FK_DOCUMENTS_DOCUMENT_TYPE'))) {
      await queryRunner.createForeignKey('documents', new TableForeignKey({
        name: 'FK_DOCUMENTS_DOCUMENT_TYPE',
        columnNames: ['document_type_id'],
        referencedTableName: 'document_types',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }));
    }
    if (!(await queryRunner.hasForeignKey('documents', 'FK_DOCUMENTS_DOCUMENT_SUBTYPE'))) {
      await queryRunner.createForeignKey('documents', new TableForeignKey({
        name: 'FK_DOCUMENTS_DOCUMENT_SUBTYPE',
        columnNames: ['document_subtype_id'],
        referencedTableName: 'document_subtypes',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      })) ;
    }

    // 1.6. Create new indices for documents
    if (!(await queryRunner.hasIndex('documents', 'IDX_DOCUMENTS_TYPE_SUBTYPE_CONTRACT'))) {
      await queryRunner.createIndex('documents', new TableIndex({
        name: 'IDX_DOCUMENTS_TYPE_SUBTYPE_CONTRACT',
        columnNames: ['document_type_id', 'document_subtype_id', 'contract_id'],
        isUnique: true,
      }));
    }

    // 2.1. Add document_type_id and document_subtype_id columns to documents_history
    if (!(await queryRunner.hasColumn('documents_history', 'document_type_id'))) {
      await queryRunner.addColumn('documents_history', new TableColumn({
        name: 'document_type_id',
        type: 'varchar',
        length: '36',
        isNullable: true,
      }));
    }
    if (!(await queryRunner.hasColumn('documents_history', 'document_subtype_id'))) {
      await queryRunner.addColumn('documents_history', new TableColumn({
        name: 'document_subtype_id',
        type: 'varchar',
        length: '36',
        isNullable: true,
      }));
    }
    // 2.2. Update documents_history with type and subtype from templates
    if (!(await queryRunner.hasColumn('documents_history', 'template_id'))) {
      await queryRunner.query(`
        UPDATE documents_history dh
        INNER JOIN document_templates dt ON dh.template_id = dt.id
        SET dh.document_type_id = dt.document_type_id,
            dh.document_subtype_id = dt.document_subtype_id
      `);
    }

    // 2.3. Drop template_id column with foreign keys and indexes
    await queryRunner.dropColumn('documents_history', 'template_id');

    // 2.4. Make both ids not nullable
    if (await queryRunner.isNullable('documents_history', 'document_type_id')) {
      await queryRunner.changeColumn('documents_history', new TableColumn({
        name: 'document_type_id',
        type: 'varchar',
        length: '36',
        isNullable: false,
      }));
    }
    if (await queryRunner.isNullable('documents_history', 'document_subtype_id')) {
      await queryRunner.changeColumn('documents_history', new TableColumn({
        name: 'document_subtype_id',
        type: 'varchar',
        length: '36',
        isNullable: false,
      }));
    }

    // 2.5. Add foreign keys for type and subtype in documents_history
    if (!(await queryRunner.hasForeignKey('documents_history', 'FK_DOCUMENTS_HISTORY_DOCUMENT_TYPE'))) {
      await queryRunner.createForeignKey('documents_history', new TableForeignKey({
        name: 'FK_DOCUMENTS_HISTORY_DOCUMENT_TYPE',
        columnNames: ['document_type_id'],
        referencedTableName: 'document_types',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }));
    }
    if (!(await queryRunner.hasForeignKey('documents_history', 'FK_DOCUMENTS_HISTORY_DOCUMENT_SUBTYPE'))) {
      await queryRunner.createForeignKey('documents_history', new TableForeignKey({
        name: 'FK_DOCUMENTS_HISTORY_DOCUMENT_SUBTYPE',
        columnNames: ['document_subtype_id'],
        referencedTableName: 'document_subtypes',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }));
    }
    // 2.6. Create new indices for documents_history
    if (!(await queryRunner.hasIndex('documents_history', 'IDX_DOCUMENTS_TYPE_SUBTYPE_CONTRACT'))) {
      await queryRunner.createIndex('documents_history', new TableIndex({
        name: 'IDX_DOCUMENTS_TYPE_SUBTYPE_CONTRACT',
        columnNames: ['document_type_id', 'document_subtype_id', 'contract_id'],
        isUnique: true,
      }));
    }

    // 3. Drop FK from contract_templates to document_templates before dropping the table
    await queryRunner.dropForeignKeyByField('contract_templates', 'document_template_id');

    // 4. Drop document_templates table
    await queryRunner.dropTable('document_templates', true, true, true);
  }

  public async onDown(queryRunner: IQueryRunner): Promise<void> {
    // 4. Recreate document_templates table
    await queryRunner.createTable(new Table({
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
    }));

    // Add FKs to document_templates
    if (!(await queryRunner.hasForeignKey('document_templates', 'FK_DOCUMENT_TEMPLATES_DOCUMENT_TYPE'))) {
      await queryRunner.createForeignKey('document_templates', new TableForeignKey({
        name: 'FK_DOCUMENT_TEMPLATES_DOCUMENT_TYPE',
        columnNames: ['document_type_id'],
        referencedTableName: 'document_types',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      }));
    }
    if (!(await queryRunner.hasForeignKey('document_templates', 'FK_DOCUMENT_TEMPLATES_DOCUMENT_SUBTYPE'))) {
      await queryRunner.createForeignKey('document_templates', new TableForeignKey({
        name: 'FK_DOCUMENT_TEMPLATES_DOCUMENT_SUBTYPE',
        columnNames: ['document_subtype_id'],
        referencedTableName: 'document_subtypes',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      }));
    }

    // Fill documents+templates from documents and documents_history
    // Clean up first to avoid duplicates
    /*
    await queryRunner.query('DELETE FROM document_templates');
    await queryRunner.query(`
      INSERT INTO document_templates (id, name, document_type_id, document_subtype_id, created_at, updated_at)
      SELECT DISTINCT
        UUID() as id,
        CONCAT(dt.name, '_', dst.name, '_', NOW()) as name,
        d.document_type_id,
        d.document_subtype_id,
        NOW() as created_at,
        NOW() as updated_at
      FROM (
        (
          SELECT DISTINCT document_type_id, document_subtype_id
          FROM documents
          WHERE document_type_id IS NOT NULL AND document_subtype_id IS NOT NULL
        ) UNION (
          SELECT DISTINCT document_type_id, document_subtype_id
          FROM documents_history
          WHERE document_type_id IS NOT NULL AND document_subtype_id IS NOT NULL
        )
      ) d
      JOIN document_types dt ON d.document_type_id = dt.id
      JOIN document_subtypes dst ON d.document_subtype_id = dst.id
    `);
    */

    // 3. Restore FK from contract_templates to document_templates
    if (!(await queryRunner.hasForeignKey('contract_templates', 'FK_CONTRACT_TEMPLATES_DOCUMENT_TEMPLATE'))) {
      await queryRunner.createForeignKey('contract_templates', new TableForeignKey({
        name: 'FK_CONTRACT_TEMPLATES_DOCUMENT_TEMPLATE',
        columnNames: ['document_template_id'],
        referencedTableName: 'document_templates',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }));
    }

    // 2.6. Remove indices and foreign keys for documents_history
    await queryRunner.dropForeignKeyByField('documents_history', ['document_type_id', 'document_subtype_id']);
    if (await queryRunner.hasIndex('documents_history', 'IDX_DOCUMENTS_TYPE_SUBTYPE_CONTRACT')) {
      try {
        await queryRunner.dropIndex('documents_history', 'IDX_DOCUMENTS_TYPE_SUBTYPE_CONTRACT');
      } catch (e: any) {
        if (e.message && e.message.includes('needed in a foreign key constraint')) {
          // Workaround: Drop FK, Drop Index, Recreate FK
          await queryRunner.dropForeignKey('documents_history', 'FK_DOCUMENTS_HISTORY_CONTRACT');
          await queryRunner.dropIndex('documents_history', 'IDX_DOCUMENTS_TYPE_SUBTYPE_CONTRACT');
          await queryRunner.createForeignKey('documents_history', new TableForeignKey({
            name: 'FK_DOCUMENTS_HISTORY_CONTRACT',
            columnNames: ['contract_id'],
            referencedTableName: 'contracts',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE',
          }));
        } else {
          throw e;
        }
      }
    }

    // 2.3. Add template_id column
    if (!(await queryRunner.hasColumn('documents_history', 'template_id'))) {
      await queryRunner.addColumn('documents_history', new TableColumn({
        name: 'template_id',
        type: 'varchar',
        length: '36',
        isNullable: true, // Initially nullable
      }));
    }

    // 2.2. Update documents_history with template_id from type and subtype
    // Only update if template_id exists
    if (!(await queryRunner.hasColumn('documents_history', 'template_id'))) {
      await queryRunner.query(`
        UPDATE documents_history dh
        INNER JOIN document_templates dt
          ON dh.document_type_id = dt.document_type_id
          AND dh.document_subtype_id = dt.document_subtype_id
        SET dh.template_id = dt.id
      `);
    }

    // Make template_id not nullable
    if (await queryRunner.isNullable('documents_history', 'template_id')) {
      await queryRunner.changeColumn('documents_history', new TableColumn({
        name: 'template_id',
        type: 'varchar',
        length: '36',
        isNullable: false,
      }));
    }

    // Create foreign key
    if (!(await queryRunner.hasForeignKey('documents_history', 'FK_DOCUMENTS_HISTORY_TEMPLATE'))) {
      await queryRunner.createForeignKey('documents_history', new TableForeignKey({
        name: 'FK_DOCUMENTS_HISTORY_TEMPLATE',
        columnNames: ['template_id'],
        referencedTableName: 'document_templates',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }));
    }

    // 2.1. Remove document_type_id and document_subtype_id columns from documents_history
    await queryRunner.dropColumn('documents_history', ['document_type_id', 'document_subtype_id']);

    // 1.6. Remove indices and foreign keys for documents
    await queryRunner.dropForeignKeyByField('documents', ['document_type_id', 'document_subtype_id']);
    if (await queryRunner.hasIndex('documents', 'IDX_DOCUMENTS_TYPE_SUBTYPE_CONTRACT')) {
      try {
        await queryRunner.dropIndex('documents', 'IDX_DOCUMENTS_TYPE_SUBTYPE_CONTRACT');
      } catch (e: any) {
        if (e.message && e.message.includes('needed in a foreign key constraint')) {
          await queryRunner.dropForeignKey('documents', 'FK_DOCUMENTS_CONTRACT');
          await queryRunner.dropIndex('documents', 'IDX_DOCUMENTS_TYPE_SUBTYPE_CONTRACT');
          await queryRunner.createForeignKey('documents', new TableForeignKey({
            name: 'FK_DOCUMENTS_CONTRACT',
            columnNames: ['contract_id'],
            referencedTableName: 'contracts',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          }));
        } else {
          throw e;
        }
      }
    }

    // 1.3. Add template_id column
    if (!(await queryRunner.hasColumn('documents', 'template_id'))) {
      await queryRunner.addColumn('documents', new TableColumn({
        name: 'template_id',
        type: 'varchar',
        length: '36',
        isNullable: true, // Initially nullable
      }));
    }

    // 1.2. Restore document_templates
    // Update documents with template_id
    /* if (!(await queryRunner.hasColumn('documents', 'template_id'))) {
      await queryRunner.query(`
        UPDATE documents d
        INNER JOIN document_templates dt
          ON d.document_type_id = dt.document_type_id
          AND d.document_subtype_id = dt.document_subtype_id
        SET d.template_id = dt.id
      `);
    } */

    // Make template_id not nullable
    if (await queryRunner.isNullable('documents', 'template_id')) {
      await queryRunner.changeColumn('documents', new TableColumn({
        name: 'template_id',
        type: 'varchar',
        length: '36',
        isNullable: false,
      }));
    }

    // Create foreign key
    if (!(await queryRunner.hasForeignKey('documents', 'FK_DOCUMENTS_TEMPLATE'))) {
      await queryRunner.createForeignKey('documents', new TableForeignKey({
        name: 'FK_DOCUMENTS_TEMPLATE',
        columnNames: ['template_id'],
        referencedTableName: 'document_templates',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }));
    }

    // 1.1. Remove document_type_id and document_subtype_id columns from documents
    await queryRunner.dropColumn('documents', ['document_type_id', 'document_subtype_id']);
  }
}
