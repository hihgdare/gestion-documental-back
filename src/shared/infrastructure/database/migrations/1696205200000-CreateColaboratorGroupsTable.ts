import { Table } from "typeorm";
import { ImprovedRunner, IQueryRunner } from "../runner";

export class CreateColaboratorGroupsTable1696205200000 extends ImprovedRunner {

  public async onUp(queryRunner: IQueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'colaborator_groups',
      columns: [
        {
          name: 'id',
          type: 'int',
          isPrimary: true,
          isGenerated: true,
          generationStrategy: 'increment',
        },
        {
          name: 'name',
          type: 'varchar',
          length: '255',
          isUnique: true,
          isNullable: false,
        },
        {
          name: 'description',
          type: 'text',
          isNullable: true,
        },
        {
          name: 'contract_id',
          type: 'varchar',
          length: '36',
          isNullable: false,
        },
        {
          name: 'created_at',
          type: 'datetime',
          default: 'CURRENT_TIMESTAMP',
          isNullable: false,
        },
        {
          name: 'updated_at',
          type: 'datetime',
          default: 'CURRENT_TIMESTAMP',
          onUpdate: 'CURRENT_TIMESTAMP',
          isNullable: false,
        },
      ],
      indices: [
        { name: 'IDX_COLABORATOR_GROUP_NAME', columnNames: ['name'], isUnique: true },
      ],
      foreignKeys: [
        {
          name: 'FK_COLABORATOR_GROUPS_CONTRACT',
          columnNames: ['contract_id'],
          referencedColumnNames: ['id'],
          referencedTableName: 'contracts',
          onDelete: 'CASCADE',
        },
      ],
    }));
  }

  public async onDown(queryRunner: IQueryRunner): Promise<void> {
    await queryRunner.dropTable('colaborator_groups');
  }

}
