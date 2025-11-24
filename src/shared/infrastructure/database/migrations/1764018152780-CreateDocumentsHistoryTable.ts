import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateDocumentsHistoryTable1764018152780 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create documents_history table
    await queryRunner.createTable(
      new Table({
        name: 'documents_history',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
          },
          {
            name: 'document_id',
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
            name: 'name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'issued_date',
            type: 'datetime',
            isNullable: false,
          },
          {
            name: 'expiration_date',
            type: 'datetime',
            isNullable: true,
          },
          {
            name: 'contract_id',
            type: 'varchar',
            length: '36',
            isNullable: true,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'document_url',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'comment',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'action',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'updated_by',
            type: 'varchar',
            length: '36',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create foreign key for document_id
    await queryRunner.createForeignKey(
      'documents_history',
      new TableForeignKey({
        name: 'FK_DOCUMENTS_HISTORY_DOCUMENT',
        columnNames: ['document_id'],
        referencedTableName: 'documents',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    // Create foreign key for document_type_id
    await queryRunner.createForeignKey(
      'documents_history',
      new TableForeignKey({
        name: 'FK_DOCUMENTS_HISTORY_DOCUMENT_TYPE',
        columnNames: ['document_type_id'],
        referencedTableName: 'document_types',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      }),
    );

    // Create foreign key for document_subtype_id
    await queryRunner.createForeignKey(
      'documents_history',
      new TableForeignKey({
        name: 'FK_DOCUMENTS_HISTORY_DOCUMENT_SUBTYPE',
        columnNames: ['document_subtype_id'],
        referencedTableName: 'document_subtypes',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      }),
    );

    // Create foreign key for contract_id (nullable)
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

    // Create foreign key for updated_by
    await queryRunner.createForeignKey(
      'documents_history',
      new TableForeignKey({
        name: 'FK_DOCUMENTS_HISTORY_UPDATED_BY',
        columnNames: ['updated_by'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      }),
    );

    // Create indices
    await queryRunner.createIndex(
      'documents_history',
      new TableIndex({
        name: 'IDX_DOCUMENTS_HISTORY_DOCUMENT_ID',
        columnNames: ['document_id'],
      }),
    );

    await queryRunner.createIndex(
      'documents_history',
      new TableIndex({
        name: 'IDX_DOCUMENTS_HISTORY_ACTION',
        columnNames: ['action'],
      }),
    );

    await queryRunner.createIndex(
      'documents_history',
      new TableIndex({
        name: 'IDX_DOCUMENTS_HISTORY_UPDATED_BY',
        columnNames: ['updated_by'],
      }),
    );

    await queryRunner.createIndex(
      'documents_history',
      new TableIndex({
        name: 'IDX_DOCUMENTS_HISTORY_STATUS',
        columnNames: ['status'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indices
    await queryRunner.dropIndex('documents_history', 'IDX_DOCUMENTS_HISTORY_STATUS');
    await queryRunner.dropIndex('documents_history', 'IDX_DOCUMENTS_HISTORY_UPDATED_BY');
    await queryRunner.dropIndex('documents_history', 'IDX_DOCUMENTS_HISTORY_ACTION');
    await queryRunner.dropIndex('documents_history', 'IDX_DOCUMENTS_HISTORY_DOCUMENT_ID');

    // Drop foreign keys
    await queryRunner.dropForeignKey('documents_history', 'FK_DOCUMENTS_HISTORY_UPDATED_BY');
    await queryRunner.dropForeignKey('documents_history', 'FK_DOCUMENTS_HISTORY_CONTRACT');
    await queryRunner.dropForeignKey('documents_history', 'FK_DOCUMENTS_HISTORY_DOCUMENT_SUBTYPE');
    await queryRunner.dropForeignKey('documents_history', 'FK_DOCUMENTS_HISTORY_DOCUMENT_TYPE');
    await queryRunner.dropForeignKey('documents_history', 'FK_DOCUMENTS_HISTORY_DOCUMENT');

    // Drop table
    await queryRunner.dropTable('documents_history');
  }
}
