import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey, TableIndex } from 'typeorm';

export class UpdateDocumentsTable1764018147265 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Make contract_id nullable
    await queryRunner.changeColumn(
      'documents',
      'contract_id',
      new TableColumn({
        name: 'contract_id',
        type: 'varchar',
        length: '36',
        isNullable: true,
      }),
    );

    // 2. Add status column
    await queryRunner.addColumn(
      'documents',
      new TableColumn({
        name: 'status',
        type: 'varchar',
        length: '50',
        isNullable: false,
        default: "'draft'",
      }),
    );

    // 3. Add created_by column (nullable to handle existing records)
    await queryRunner.addColumn(
      'documents',
      new TableColumn({
        name: 'created_by',
        type: 'varchar',
        length: '36',
        isNullable: true,
      }),
    );

    // 4. Add comment column
    await queryRunner.addColumn(
      'documents',
      new TableColumn({
        name: 'comment',
        type: 'text',
        isNullable: true,
      }),
    );

    // 5. Add deleted_at column
    await queryRunner.addColumn(
      'documents',
      new TableColumn({
        name: 'deleted_at',
        type: 'datetime',
        isNullable: true,
      }),
    );

    // 6. Add deleted_by column
    await queryRunner.addColumn(
      'documents',
      new TableColumn({
        name: 'deleted_by',
        type: 'varchar',
        length: '36',
        isNullable: true,
      }),
    );

    // 7. Create foreign key for created_by
    await queryRunner.createForeignKey(
      'documents',
      new TableForeignKey({
        name: 'FK_DOCUMENTS_CREATED_BY',
        columnNames: ['created_by'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      }),
    );

    // 8. Create foreign key for deleted_by
    await queryRunner.createForeignKey(
      'documents',
      new TableForeignKey({
        name: 'FK_DOCUMENTS_DELETED_BY',
        columnNames: ['deleted_by'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
    );

    // 9. Create index on status
    await queryRunner.createIndex(
      'documents',
      new TableIndex({
        name: 'IDX_DOCUMENTS_STATUS',
        columnNames: ['status'],
      }),
    );

    // 10. Create index on deleted_at
    await queryRunner.createIndex(
      'documents',
      new TableIndex({
        name: 'IDX_DOCUMENTS_DELETED_AT',
        columnNames: ['deleted_at'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indices
    await queryRunner.dropIndex('documents', 'IDX_DOCUMENTS_DELETED_AT');
    await queryRunner.dropIndex('documents', 'IDX_DOCUMENTS_STATUS');

    // Drop foreign keys
    await queryRunner.dropForeignKey('documents', 'FK_DOCUMENTS_DELETED_BY');
    await queryRunner.dropForeignKey('documents', 'FK_DOCUMENTS_CREATED_BY');

    // Drop columns
    await queryRunner.dropColumn('documents', 'deleted_by');
    await queryRunner.dropColumn('documents', 'deleted_at');
    await queryRunner.dropColumn('documents', 'comment');
    await queryRunner.dropColumn('documents', 'created_by');
    await queryRunner.dropColumn('documents', 'status');

    // Revert contract_id to NOT NULL
    await queryRunner.changeColumn(
      'documents',
      'contract_id',
      new TableColumn({
        name: 'contract_id',
        type: 'varchar',
        length: '36',
        isNullable: false,
      }),
    );
  }
}
