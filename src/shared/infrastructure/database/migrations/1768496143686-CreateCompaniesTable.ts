import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateCompaniesTable1768496143686 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'companies',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '200',
            isNullable: false,
          },
          {
            name: 'rut',
            type: 'varchar',
            length: '12',
            isNullable: false,
          },
          {
            name: 'address',
            type: 'varchar',
            length: '300',
            isNullable: true,
          },
          {
            name: 'contact_name',
            type: 'varchar',
            length: '150',
            isNullable: true,
          },
          {
            name: 'contact_phone',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'contact_email',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'group_id',
            type: 'varchar',
            length: '36',
            isNullable: true,
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
          {
            name: 'IDX_COMPANIES_RUT',
            columnNames: ['rut'],
          },
          {
            name: 'IDX_COMPANIES_NAME',
            columnNames: ['name'],
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('companies');
  }
}
