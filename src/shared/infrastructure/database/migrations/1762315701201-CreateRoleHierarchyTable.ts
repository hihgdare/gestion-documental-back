import { MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey } from "typeorm";
import { getRunner } from "../runner";

export class CreateRoleHierarchyTable1762315701201 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    const runner = getRunner(queryRunner);
    // Drop parent_id column if it exists
    await runner.dropColumn('roles', 'parent_id');

    // Create role_hierarchy table
    await runner.createTable(new Table({
      name: 'role_hierarchy',
      columns: [
        {
          name: 'parent_role_id',
          type: 'int',
          isPrimary: true,
          isNullable: false,
        },
        {
          name: 'child_role_id',
          type: 'int',
          isPrimary: true,
          isNullable: false,
        },
      ],
      indices: [
        {
          name: 'IDX_ROLE_HIERARCHY_PARENT_ROLE_ID',
          columnNames: ['parent_role_id'],
        },
        {
          name: 'IDX_ROLE_HIERARCHY_CHILD_ROLE_ID',
          columnNames: ['child_role_id'],
        },
      ],
      foreignKeys: [
        {
          name: 'FK_ROLE_HIERARCHY_PARENT',
          columnNames: ['parent_role_id'],
          referencedColumnNames: ['id'],
          referencedTableName: 'roles',
          onDelete: 'CASCADE',
        },
        {
          name: 'FK_ROLE_HIERARCHY_CHILD',
          columnNames: ['child_role_id'],
          referencedColumnNames: ['id'],
          referencedTableName: 'roles',
          onDelete: 'CASCADE',
        },
      ],
    }), true);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const runner = getRunner(queryRunner);
    // Drop role_hierarchy table if exists
    await runner.dropTable('role_hierarchy', true, true, true);

    // Restore parent_id only if roles table exists
    if (!(await runner.hasColumn('roles', 'parent_id'))) {
      await runner.addColumn('roles', new TableColumn({
        name: 'parent_id',
        type: 'int',
        isNullable: true,
      }));
      await runner.createForeignKey('roles', new TableForeignKey({
        name: 'FK_ROLES_PARENT',
        columnNames: ['parent_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'roles',
        onDelete: 'SET NULL',
      }));
    }
  }
}
