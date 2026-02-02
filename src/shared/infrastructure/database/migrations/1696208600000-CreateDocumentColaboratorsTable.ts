import { Table } from "typeorm";
import { ImprovedRunner, IQueryRunner } from "../runner";

export class CreateDocumentColaboratorsTable1696208600000 extends ImprovedRunner {



  public async onUp(queryRunner: IQueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'document_colaborators',
      columns: [
        {
          name: 'document_id',
          type: 'varchar',
          length: '36',
          isPrimary: true,
        },
        {
          name: 'colaborator_id',
          type: 'varchar',
          length: '36',
          isPrimary: true,
        },
        {
          name: 'created_at',
          type: 'datetime',
          default: 'CURRENT_TIMESTAMP',
          isNullable: false,
        },
      ],
      indices: [
        { name: 'IDX_DOCUMENT_COLABORATORS_DOCUMENT_ID', columnNames: ['document_id'] },
        { name: 'IDX_DOCUMENT_COLABORATORS_COLABORATOR_ID', columnNames: ['colaborator_id'] },
      ],
      foreignKeys: [
        {
          name: 'FK_DOCUMENT_COLABORATORS_DOCUMENT',
          columnNames: ['document_id'],
          referencedColumnNames: ['id'],
          referencedTableName: 'documents',
          onDelete: 'CASCADE',
        },
        {
          name: 'FK_DOCUMENT_COLABORATORS_COLABORATOR',
          columnNames: ['colaborator_id'],
          referencedColumnNames: ['id'],
          referencedTableName: 'colaborators',
          onDelete: 'CASCADE',
        },
      ],
    }));
  }

  public async onDown(queryRunner: IQueryRunner): Promise<void> {
    await queryRunner.dropTable('document_colaborators');
  }

}
