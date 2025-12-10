import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateRolesTable1762315701200 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'roles',
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
            length: '100',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'description',
            type: 'varchar',
            length: '255',
            isNullable: true,
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
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const roleHierarchy = await queryRunner.getTable('role_hierarchy');
    if (roleHierarchy) {
      const fkParent = roleHierarchy.foreignKeys.find(f => f.columnNames.includes('parent_role_id'));
      if (fkParent) {
        await queryRunner.dropForeignKey('role_hierarchy', fkParent);
      }
      const fkChild = roleHierarchy.foreignKeys.find(f => f.columnNames.includes('child_role_id'));
      if (fkChild) {
        await queryRunner.dropForeignKey('role_hierarchy', fkChild);
      }
      await queryRunner.dropTable('role_hierarchy');
    }

    if (await queryRunner.getTable('roles')) {
      await queryRunner.dropTable('roles');
    }
  }

}
