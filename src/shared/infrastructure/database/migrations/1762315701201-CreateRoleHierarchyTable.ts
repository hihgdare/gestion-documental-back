import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateRoleHierarchyTable1732479838000 implements MigrationInterface {

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
      }),
      true,
    );

    // Add foreign keys
    await queryRunner.createForeignKey(
      'role_hierarchy',
      new TableForeignKey({
        columnNames: ['parent_role_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'roles',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'role_hierarchy',
      new TableForeignKey({
        columnNames: ['child_role_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'roles',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop role_hierarchy table
    await queryRunner.dropTable('role_hierarchy');

    // Restore parent_id column to roles table
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
