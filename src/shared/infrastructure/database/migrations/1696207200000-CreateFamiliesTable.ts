import { Table } from 'typeorm';
import { ImprovedRunner, IQueryRunner } from '../runner';

export class CreateFamiliesTable1696207200000 extends ImprovedRunner {

  public async onUp(queryRunner: IQueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'families',
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
          name: 'name',
          type: 'varchar',
          length: '100',
          isUnique: true,
          isNullable: false,
        },
        {
          name: 'group_id',
          type: 'int',
          isNullable: false,
        },
        {
          name: 'created_at',
          type: 'timestamp',
          default: 'CURRENT_TIMESTAMP',
          isNullable: false,
        },
        {
          name: 'updated_at',
          type: 'timestamp',
          default: 'CURRENT_TIMESTAMP',
          onUpdate: 'CURRENT_TIMESTAMP',
          isNullable: false,
        },
        {
          name: 'deleted_at',
          type: 'timestamp',
          isNullable: true,
          default: null,
        },
      ],
      indices: [
        { name: 'IDX_FAMILIES_NAME', columnNames: ['name'], isUnique: true },
        { name: 'IDX_FAMILIES_CONTRACT_ID', columnNames: ['contract_id'] },
        { name: 'IDX_FAMILIES_GROUP_ID', columnNames: ['group_id'] },
      ],
      foreignKeys: [
        {
          name: 'FK_FAMILIES_CONTRACT',
          columnNames: ['contract_id'],
          referencedTableName: 'contracts',
          referencedColumnNames: ['id'],
          onDelete: 'CASCADE',
        },
        {
          name: 'FK_FAMILIES_GROUP',
          columnNames: ['group_id'],
          referencedTableName: 'colaborator_groups',
          referencedColumnNames: ['id'],
          onDelete: 'CASCADE',
        },
      ],
    }));
  }

  public async onDown(queryRunner: IQueryRunner): Promise<void> {
    await queryRunner.dropTable('families');
  }

}
