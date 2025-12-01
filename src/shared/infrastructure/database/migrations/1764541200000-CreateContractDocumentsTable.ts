import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateContractDocumentsTable1764541200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'contract_documents',
        columns: [
          { name: 'id', type: 'varchar', length: '36', isPrimary: true },
          { name: 'contract_id', type: 'varchar', length: '36', isNullable: false },
          { name: 'document_id', type: 'varchar', length: '36', isNullable: false },
          { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP', isNullable: false },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'contract_documents',
      new TableForeignKey({
        name: 'FK_CONTRACT_DOCUMENTS_CONTRACT',
        columnNames: ['contract_id'],
        referencedTableName: 'contracts',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'contract_documents',
      new TableForeignKey({
        name: 'FK_CONTRACT_DOCUMENTS_DOCUMENT',
        columnNames: ['document_id'],
        referencedTableName: 'documents',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    await queryRunner.createIndex(
      'contract_documents',
      new TableIndex({
        name: 'IDX_CONTRACT_DOCUMENTS_CONTRACT_ID',
        columnNames: ['contract_id'],
      }),
    );

    await queryRunner.createIndex(
      'contract_documents',
      new TableIndex({
        name: 'IDX_CONTRACT_DOCUMENTS_DOCUMENT_ID',
        columnNames: ['document_id'],
      }),
    );

    await queryRunner.createIndex(
      'contract_documents',
      new TableIndex({
        name: 'UQ_CONTRACT_DOCUMENTS_CONTRACT_DOCUMENT',
        columnNames: ['contract_id', 'document_id'],
        isUnique: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('contract_documents', 'UQ_CONTRACT_DOCUMENTS_CONTRACT_DOCUMENT');
    await queryRunner.dropIndex('contract_documents', 'IDX_CONTRACT_DOCUMENTS_DOCUMENT_ID');
    await queryRunner.dropIndex('contract_documents', 'IDX_CONTRACT_DOCUMENTS_CONTRACT_ID');
    await queryRunner.dropForeignKey('contract_documents', 'FK_CONTRACT_DOCUMENTS_DOCUMENT');
    await queryRunner.dropForeignKey('contract_documents', 'FK_CONTRACT_DOCUMENTS_CONTRACT');
    await queryRunner.dropTable('contract_documents');
  }
}

