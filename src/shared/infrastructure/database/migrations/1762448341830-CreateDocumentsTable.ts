import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateDocumentsTable1762448341830 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create documents table
    await queryRunner.createTable(
      new Table({
        name: 'documents',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
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
            isNullable: false,
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
            name: 'created_at',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
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

    // Create foreign key for document_type_id
    await queryRunner.createForeignKey(
      'documents',
      new TableForeignKey({
        name: 'FK_DOCUMENTS_DOCUMENT_TYPE',
        columnNames: ['document_type_id'],
        referencedTableName: 'document_types',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      }),
    );

    // Create foreign key for document_subtype_id
    await queryRunner.createForeignKey(
      'documents',
      new TableForeignKey({
        name: 'FK_DOCUMENTS_DOCUMENT_SUBTYPE',
        columnNames: ['document_subtype_id'],
        referencedTableName: 'document_subtypes',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      }),
    );

    // Create foreign key for contract_id
    await queryRunner.createForeignKey(
      'documents',
      new TableForeignKey({
        name: 'FK_DOCUMENTS_CONTRACT',
        columnNames: ['contract_id'],
        referencedTableName: 'contracts',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    // Create index on contract_id for performance
    await queryRunner.createIndex(
      'documents',
      new TableIndex({
        name: 'IDX_DOCUMENTS_CONTRACT_ID',
        columnNames: ['contract_id'],
      }),
    );

    // Create index on document_type_id for performance
    await queryRunner.createIndex(
      'documents',
      new TableIndex({
        name: 'IDX_DOCUMENTS_DOCUMENT_TYPE_ID',
        columnNames: ['document_type_id'],
      }),
    );

    // Create index on document_subtype_id for performance
    await queryRunner.createIndex(
      'documents',
      new TableIndex({
        name: 'IDX_DOCUMENTS_DOCUMENT_SUBTYPE_ID',
        columnNames: ['document_subtype_id'],
      }),
    );

    // Create index on expiration_date for expiring documents query
    await queryRunner.createIndex(
      'documents',
      new TableIndex({
        name: 'IDX_DOCUMENTS_EXPIRATION_DATE',
        columnNames: ['expiration_date'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indices
    await queryRunner.dropIndex('documents', 'IDX_DOCUMENTS_EXPIRATION_DATE');
    await queryRunner.dropIndex('documents', 'IDX_DOCUMENTS_DOCUMENT_SUBTYPE_ID');
    await queryRunner.dropIndex('documents', 'IDX_DOCUMENTS_DOCUMENT_TYPE_ID');
    await queryRunner.dropIndex('documents', 'IDX_DOCUMENTS_CONTRACT_ID');

    // Drop foreign keys
    await queryRunner.dropForeignKey('documents', 'FK_DOCUMENTS_CONTRACT');
    await queryRunner.dropForeignKey('documents', 'FK_DOCUMENTS_DOCUMENT_SUBTYPE');
    await queryRunner.dropForeignKey('documents', 'FK_DOCUMENTS_DOCUMENT_TYPE');

    // Drop table
    await queryRunner.dropTable('documents');
  }
}
