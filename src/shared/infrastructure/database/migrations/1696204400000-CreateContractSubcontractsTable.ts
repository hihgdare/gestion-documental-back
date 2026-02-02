import { Table } from 'typeorm';
import { ImprovedRunner, IQueryRunner } from '../runner';

export class CreateContractSubcontractsTable1696204400000 extends ImprovedRunner {

  public async onUp(queryRunner: IQueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'contract_subcontracts',
      columns: [
        {
          name: 'id',
          type: 'varchar',
          length: '36',
          isPrimary: true,
          generationStrategy: 'uuid',
        },
        {
          name: 'contract_id',
          type: 'varchar',
          length: '36',
          isNullable: false,
        },
        {
          name: 'subcontract_id',
          type: 'varchar',
          length: '36',
          isNullable: false,
        },
        {
          name: 'created_at',
          type: 'timestamp',
          default: 'CURRENT_TIMESTAMP',
          isNullable: false,
        },
      ],
      indices: [
        { name: 'IDX_CONTRACT_SUBCONTRACT_UNIQUE', columnNames: ['contract_id', 'subcontract_id'] },
      ],
      foreignKeys: [
        {
          name: 'FK_CONTRACT_SUBCONTRACTS_CONTRACT',
          columnNames: ['contract_id'],
          referencedColumnNames: ['id'],
          referencedTableName: 'contracts',
          onDelete: 'CASCADE',
        },
        {
          name: 'FK_CONTRACT_SUBCONTRACTS_SUBCONTRACT',
          columnNames: ['subcontract_id'],
          referencedColumnNames: ['id'],
          referencedTableName: 'contracts',
          onDelete: 'CASCADE',
        },
      ],
    }));
  }

  public async onDown(queryRunner: IQueryRunner): Promise<void> {
    await queryRunner.dropTable('contract_subcontracts');
  }

}
