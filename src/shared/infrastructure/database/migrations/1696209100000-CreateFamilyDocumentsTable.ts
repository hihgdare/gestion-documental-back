import { Table } from 'typeorm';
import { ImprovedRunner, IQueryRunner } from '../runner';

export class CreateFamilyDocumentsTable1696209100000 extends ImprovedRunner {

  public async onUp(queryRunner: IQueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'family_documents',
      columns: [
        {
          name: 'family_id',
          type: 'varchar',
          length: '36',
          isPrimary: true,
        },
        {
          name: 'document_model_id',
          type: 'varchar',
          length: '36',
          isPrimary: true,
        },
        {
          name: 'created_at',
          type: 'timestamp',
          default: 'CURRENT_TIMESTAMP',
          isNullable: false,
        },
      ],
      indices: [
        { name: 'IDX_FAMILY_DOCUMENTS_FAMILY', columnNames: ['family_id'] },
        { name: 'IDX_FAMILY_DOCUMENTS_MODEL', columnNames: ['document_model_id'] },
      ],
      foreignKeys: [
        {
          name: 'FK_FAMILY_DOCUMENTS_FAMILY',
          columnNames: ['family_id'],
          referencedColumnNames: ['id'],
          referencedTableName: 'families',
          onDelete: 'CASCADE',
        },
        {
          name: 'FK_FAMILY_DOCUMENTS_MODEL',
          columnNames: ['document_model_id'],
          referencedColumnNames: ['id'],
          referencedTableName: 'document_models',
          onDelete: 'CASCADE',
        },
      ],
    }));
  }

  public async onDown(queryRunner: IQueryRunner): Promise<void> {
    await queryRunner.dropTable('family_documents');
  }

}
