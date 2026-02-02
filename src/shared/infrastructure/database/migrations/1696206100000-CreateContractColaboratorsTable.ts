import { Table } from 'typeorm';
import { ImprovedRunner, IQueryRunner } from '../runner';

export class CreateContractColaboratorsTable1696206100000 extends ImprovedRunner {

  public async onUp(queryRunner: IQueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'contract_colaborators',
      columns: [
        {
          name: 'contract_id',
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
      ],
      foreignKeys: [
        {
          name: 'FK_CONTRACT_COLABORATORS_COLABORATOR',
          columnNames: ['colaborator_id'],
          referencedColumnNames: ['id'],
          referencedTableName: 'colaborators',
          onDelete: 'CASCADE',
        },
        {
          name: 'FK_CONTRACT_COLABORATORS_CONTRACT',
          columnNames: ['contract_id'],
          referencedColumnNames: ['id'],
          referencedTableName: 'contracts',
          onDelete: 'CASCADE',
        },
      ],
    }));
  }

  public async onDown(queryRunner: IQueryRunner): Promise<void> {
    await queryRunner.dropTable('contract_colaborators');
  }

}
