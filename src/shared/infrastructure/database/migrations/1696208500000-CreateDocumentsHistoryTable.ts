import { Table } from 'typeorm';
import { ImprovedRunner, IQueryRunner } from '../runner';

export class CreateDocumentsHistoryTable1696208500000 extends ImprovedRunner {



  public async onUp(queryRunner: IQueryRunner): Promise<void> {
    // Create documents_history table
    await queryRunner.createTable(new Table({
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
          name: 'name',
          type: 'varchar',
          length: '255',
          isNullable: false,
        },
        {
          name: 'issued_date',
          type: 'date',
          isNullable: true,
        },
        {
          name: 'expiration_date',
          type: 'date',
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
          name: 'contract_id',
          type: 'varchar',
          length: '36',
          isNullable: true,
        },
        {
          name: 'document_model_id',
          type: 'varchar',
          length: '36',
          isNullable: false,
        },
        {
          name: 'updated_by',
          type: 'varchar',
          length: '36',
          isNullable: true,
        },
        {
          name: 'updated_at',
          type: 'datetime',
          default: 'CURRENT_TIMESTAMP',
          onUpdate: 'CURRENT_TIMESTAMP',
        },
      ],
      indices: [
        { name: 'IDX_DOCUMENTS_HISTORY_ACTION', columnNames: ['action'] },
        { name: 'IDX_DOCUMENTS_HISTORY_DOCUMENT', columnNames: ['document_id'] },
        { name: 'IDX_DOCUMENTS_HISTORY_STATUS', columnNames: ['status'] },
      ],
      foreignKeys: [
        {
          name: 'FK_DOCUMENTS_HISTORY_CONTRACT',
          columnNames: ['contract_id'],
          referencedTableName: 'contracts',
          referencedColumnNames: ['id'],
          onDelete: 'SET NULL',
          onUpdate: 'CASCADE',
        },
        {
          name: 'FK_DOCUMENTS_HISTORY_DOCUMENT',
          columnNames: ['document_id'],
          referencedTableName: 'documents',
          referencedColumnNames: ['id'],
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        },
        {
          name: 'FK_DOCUMENTS_HISTORY_DOCUMENT_MODEL',
          columnNames: ['document_model_id'],
          referencedColumnNames: ['id'],
          referencedTableName: 'document_models',
          onDelete: 'RESTRICT',
        },
        {
          name: 'FK_DOCUMENTS_HISTORY_UPDATED_BY',
          columnNames: ['updated_by'],
          referencedTableName: 'users',
          referencedColumnNames: ['id'],
          onDelete: 'RESTRICT',
          onUpdate: 'CASCADE',
        },
      ],
    }));
  }

  public async onDown(queryRunner: IQueryRunner): Promise<void> {
    await queryRunner.dropTable('documents_history');
  }

}
