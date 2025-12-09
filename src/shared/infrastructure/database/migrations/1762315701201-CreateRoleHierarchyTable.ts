import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateRoleHierarchyTable1762315701201 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop parent_id column if it exists
    const rolesTable = await queryRunner.getTable('roles');
    if (rolesTable) {
      const parentIdColumn = rolesTable.findColumnByName('parent_id');
      if (parentIdColumn) {
        // Drop foreign key first if it exists
        const foreignKeys = rolesTable.foreignKeys.filter(fk =>
          fk.columnNames.includes('parent_id'),
        );
        for (const fk of foreignKeys) {
          await queryRunner.dropForeignKey('roles', fk);
        }
        // Drop the column
        await queryRunner.dropColumn('roles', 'parent_id');
      }
    }

    // Create role_hierarchy table
    await queryRunner.createTable(
      new Table({
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
      }),
      true,
    );

    // Add foreign keys (idempotent)
    const roleHierarchy = await queryRunner.getTable('role_hierarchy');
    const hasParentFk = roleHierarchy?.foreignKeys.some(fk => fk.columnNames.includes('parent_role_id'));
    const hasChildFk = roleHierarchy?.foreignKeys.some(fk => fk.columnNames.includes('child_role_id'));
    if (!hasParentFk) {
      await queryRunner.createForeignKey(
        'role_hierarchy',
        new TableForeignKey({
          name: 'FK_ROLE_HIERARCHY_PARENT',
          columnNames: ['parent_role_id'],
          referencedColumnNames: ['id'],
          referencedTableName: 'roles',
          onDelete: 'CASCADE',
        }),
      );
    }
    if (!hasChildFk) {
      await queryRunner.createForeignKey(
        'role_hierarchy',
        new TableForeignKey({
          name: 'FK_ROLE_HIERARCHY_CHILD',
          columnNames: ['child_role_id'],
          referencedColumnNames: ['id'],
          referencedTableName: 'roles',
          onDelete: 'CASCADE',
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop role_hierarchy table if exists
    const roleHierarchy = await queryRunner.getTable('role_hierarchy');
    if (roleHierarchy) {
      await queryRunner.dropTable('role_hierarchy');
    }

    // Restore parent_id only if roles table exists
    const rolesTable = await queryRunner.getTable('roles');
    if (rolesTable && !rolesTable.findColumnByName('parent_id')) {
      await queryRunner.query(`
        ALTER TABLE roles ADD COLUMN parent_id INT NULL
      `);

      await queryRunner.createForeignKey(
        'roles',
        new TableForeignKey({
          columnNames: ['parent_id'],
          referencedColumnNames: ['id'],
          referencedTableName: 'roles',
          onDelete: 'SET NULL',
        }),
      );
    }
  }

}
