import { Table } from "typeorm";
import { ImprovedRunner, IQueryRunner } from "../runner";

export class CreateColaboratorGroupColaboratorsTable1696205300000 extends ImprovedRunner {

  public async onUp(queryRunner: IQueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'colaborator_group_colaborators',
      columns: [
        {
          name: 'colaborator_group_id',
          type: 'int',
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
        { name: 'IDX_COLABORATOR_GROUP_COLABORATORS_GROUP_ID', columnNames: ['colaborator_group_id'] },
        { name: 'IDX_COLABORATOR_GROUP_COLABORATORS_COLABORATOR_ID', columnNames: ['colaborator_id'] },
      ],
      foreignKeys: [
        {
          name: 'FK_COLABORATOR_GROUP_COLABORATORS_GROUP',
          columnNames: ['colaborator_group_id'],
          referencedColumnNames: ['id'],
          referencedTableName: 'colaborator_groups',
          onDelete: 'CASCADE',
        },
        {
          name: 'FK_COLABORATOR_GROUP_COLABORATORS_COLABORATOR',
          columnNames: ['colaborator_id'],
          referencedColumnNames: ['id'],
          referencedTableName: 'colaborators',
          onDelete: 'CASCADE',
        },
      ],
    }));
  }

  public async onDown(queryRunner: IQueryRunner): Promise<void> {
    await queryRunner.dropTable('colaborator_group_colaborators');
  }

}
