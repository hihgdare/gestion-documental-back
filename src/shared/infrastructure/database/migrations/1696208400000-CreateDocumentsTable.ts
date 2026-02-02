import { Table } from 'typeorm';
import { ImprovedRunner, IQueryRunner } from '../runner';

export class CreateDocumentsTable1696208400000 extends ImprovedRunner {



  public async onUp(queryRunner: IQueryRunner): Promise<void> {
    // Create documents table
    await queryRunner.createTable(new Table({
      name: 'documents',
      columns: [
        {
          name: 'id',
          type: 'varchar',
          length: '36',
          isPrimary: true,
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
          name: 'document_model_id',
          type: 'varchar',
          length: '36',
          isNullable: false,
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
          default: "'draft'",
        },
        {
          name: 'comment',
          type: 'text',
          isNullable: true,
        },
        {
          name: 'created_by',
          type: 'varchar',
          length: '36',
          isNullable: true,
        },
        {
          name: 'deleted_by',
          type: 'varchar',
          length: '36',
          isNullable: true,
        },
        {
          name: 'group_id',
          type: 'int',
          isNullable: false,
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
        {
          name: 'deleted_at',
          type: 'datetime',
          isNullable: true,
        },
      ],
      indices: [
        { name: 'IDX_DOCUMENTS_CONTRACT_ID', columnNames: ['contract_id'] },
        { name: 'IDX_DOCUMENTS_EXPIRATION_DATE', columnNames: ['expiration_date'] },
        { name: 'IDX_DOCUMENTS_STATUS', columnNames: ['status'] },
        { name: 'IDX_DOCUMENTS_DELETED_AT', columnNames: ['deleted_at'] },
        { name: 'IDX_DOCUMENTS_GROUP_ID', columnNames: ['group_id'] },
      ],
      foreignKeys: [
        {
          name: 'FK_DOCUMENTS_DOCUMENT_MODEL',
          columnNames: ['document_model_id'],
          referencedColumnNames: ['id'],
          referencedTableName: 'document_models',
          onDelete: 'RESTRICT',
        },
        {
          name: 'FK_DOCUMENTS_CONTRACT',
          columnNames: ['contract_id'],
          referencedTableName: 'contracts',
          referencedColumnNames: ['id'],
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        },
        {
          name: 'FK_DOCUMENTS_CREATED_BY',
          columnNames: ['created_by'],
          referencedTableName: 'users',
          referencedColumnNames: ['id'],
          onDelete: 'RESTRICT',
          onUpdate: 'CASCADE',
        },
        {
          name: 'FK_DOCUMENTS_DELETED_BY',
          columnNames: ['deleted_by'],
          referencedTableName: 'users',
          referencedColumnNames: ['id'],
          onDelete: 'SET NULL',
          onUpdate: 'CASCADE',
        },
        {
          name: 'FK_DOCUMENTS_GROUP',
          columnNames: ['group_id'],
          referencedTableName: 'colaborator_groups',
          referencedColumnNames: ['id'],
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        },
      ],
    }));
  }

  public async onDown(queryRunner: IQueryRunner): Promise<void> {
    await queryRunner.dropTable('documents');
  }

}
