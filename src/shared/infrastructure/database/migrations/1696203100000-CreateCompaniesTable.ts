import { Table } from 'typeorm';
import { ImprovedRunner, IQueryRunner } from '../runner';

export class CreateCompaniesTable1696203100000 extends ImprovedRunner {

  public async onUp(queryRunner: IQueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'companies',
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
          name: 'tax_id',
          type: 'varchar',
          length: '50',
          isUnique: true,
          isNullable: false,
        },
        {
          name: 'address',
          type: 'varchar',
          length: '255',
          isNullable: true,
        },
        {
          name: 'phone',
          type: 'varchar',
          length: '50',
          isNullable: true,
        },
        {
          name: 'email',
          type: 'varchar',
          length: '255',
          isNullable: true,
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
        },
        {
          name: 'updated_at',
          type: 'timestamp',
          default: 'CURRENT_TIMESTAMP',
          onUpdate: 'CURRENT_TIMESTAMP',
        },
        {
          name: 'deleted_at',
          type: 'timestamp',
          isNullable: true,
        },
      ],
      foreignKeys: [
        {
          name: 'FK_COMPANIES_GROUP',
          columnNames: ['group_id'],
          referencedTableName: 'groups',
          referencedColumnNames: ['id'],
          onDelete: 'CASCADE',
        },
      ],
    }));
  }

  public async onDown(queryRunner: IQueryRunner): Promise<void> {
    await queryRunner.dropTable('companies');
  }

}
