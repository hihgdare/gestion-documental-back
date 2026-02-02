import { Table } from "typeorm";
import { ImprovedRunner, IQueryRunner } from "../runner";

export class CreateContractReviewersTable1696204500000 extends ImprovedRunner {

  public async onUp(queryRunner: IQueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'contract_reviewers',
      columns: [
        {
          name: 'id',
          type: 'varchar',
          length: '36',
          isPrimary: true,
        },
        {
          name: 'user_id',
          type: 'varchar',
          length: '36',
          isNullable: false,
        },
        {
          name: 'contract_id',
          type: 'varchar',
          length: '36',
          isNullable: false,
        },
        {
          name: 'is_primary',
          type: 'boolean',
          default: false,
          isNullable: false,
        },
        {
          name: 'valid_until',
          type: 'date',
          isNullable: true,
        },
        {
          name: 'created_at',
          type: 'datetime',
          default: 'CURRENT_TIMESTAMP',
          isNullable: false,
        },
      ],
      indices: [
        { name: 'IDX_CONTRACT_REVIEWERS_CONTRACT_ID', columnNames: ['contract_id'] },
        { name: 'IDX_CONTRACT_REVIEWERS_USER_CONTRACT', columnNames: ['user_id', 'contract_id'], isUnique: true },
        { name: 'IDX_CONTRACT_REVIEWERS_USER_ID', columnNames: ['user_id'] },
      ],
      foreignKeys: [
        {
          name: 'FK_CONTRACT_REVIEWERS_USER',
          columnNames: ['user_id'],
          referencedColumnNames: ['id'],
          referencedTableName: 'users',
          onDelete: 'CASCADE',
        },
        {
          name: 'FK_CONTRACT_REVIEWERS_CONTRACT',
          columnNames: ['contract_id'],
          referencedColumnNames: ['id'],
          referencedTableName: 'contracts',
          onDelete: 'CASCADE',
        },
      ],
    }));
  }

  public async onDown(queryRunner: IQueryRunner): Promise<void> {
    await queryRunner.dropTable('contract_reviewers');
  }

}
