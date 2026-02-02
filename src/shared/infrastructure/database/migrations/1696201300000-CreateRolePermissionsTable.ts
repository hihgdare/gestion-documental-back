import { Table } from "typeorm";
import { ImprovedRunner, IQueryRunner } from "../runner";

export class CreateRolePermissionsTable1696201300000 extends ImprovedRunner {

  public async onUp(queryRunner: IQueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'role_permissions',
      columns: [
        {
          name: 'role_id',
          type: 'int',
          isPrimary: true,
        },
        {
          name: 'permission_id',
          type: 'int',
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
        { name: 'IDX_ROLE_PERMISSIONS_ROLE_ID', columnNames: ['role_id'] },
        { name: 'IDX_ROLE_PERMISSIONS_PERMISSION_ID', columnNames: ['permission_id'] },
      ],
      foreignKeys: [
        {
          name: 'FK_ROLE_PERMISSIONS_ROLE',
          columnNames: ['role_id'],
          referencedColumnNames: ['id'],
          referencedTableName: 'roles',
          onDelete: 'CASCADE',
        },
        {
          name: 'FK_ROLE_PERMISSIONS_PERMISSION',
          columnNames: ['permission_id'],
          referencedColumnNames: ['id'],
          referencedTableName: 'permissions',
          onDelete: 'CASCADE',
        },
      ],
    }));
  }

  public async onDown(queryRunner: IQueryRunner): Promise<void> {
    await queryRunner.dropTable('role_permissions');
  }

}
