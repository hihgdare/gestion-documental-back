import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateUserRolesTable1762315701210 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'user_roles',
        columns: [
          { name: 'user_id', type: 'varchar', length: '36', isPrimary: true },
          { name: 'role_id', type: 'int', isPrimary: true },
          { name: 'created_at', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
        ],
        foreignKeys: [
          { columnNames: ['user_id'], referencedTableName: 'users', referencedColumnNames: ['id'], onDelete: 'CASCADE' },
          { columnNames: ['role_id'], referencedTableName: 'roles', referencedColumnNames: ['id'], onDelete: 'CASCADE' },
        ],
        indices: [
          { name: 'IDX_USER_ROLES_USER_ID', columnNames: ['user_id'] },
          { name: 'IDX_USER_ROLES_ROLE_ID', columnNames: ['role_id'] },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('user_roles');
  }
}

