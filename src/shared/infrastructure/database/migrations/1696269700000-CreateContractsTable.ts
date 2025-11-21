import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateContractsTable1696269700000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'contracts',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'rut_sociedad',
            type: 'varchar',
            length: '12',
            isNullable: false,
          },
          {
            name: 'nombre_colaborador',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'start_date',
            type: 'date',
            isNullable: false,
          },
          {
            name: 'end_date',
            type: 'date',
            isNullable: false,
          },
          {
            name: 'contract_type',
            type: 'enum',
            enum: ['indefinido', 'plazo_fijo', 'obra_faena', 'consultoria', 'honorarios'],
            isNullable: false,
          },
          {
            name: 'administrador_contrato_mandante',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'administrador_contrato_empresa',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'rut_administrador_contrato',
            type: 'varchar',
            length: '12',
            isNullable: false,
          },
          {
            name: 'contract_number',
            type: 'varchar',
            length: '50',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'nombre_mandante',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'division',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'area',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'dotacion_personal',
            type: 'int',
            isNullable: true,
            default: 0,
          },
          {
            name: 'dotacion_vehiculos',
            type: 'int',
            isNullable: true,
            default: 0,
          },
          {
            name: 'descripcion_servicio',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'nombre_proyecto',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'jornada_trabajo',
            type: 'enum',
            enum: ['completa', 'parcial', 'turno', 'especial'],
            isNullable: false,
            default: "'completa'",
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['draft', 'active', 'suspended', 'terminated', 'expired'],
            default: "'draft'",
            isNullable: false,
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
        ],
        indices: [
          {
            name: 'IDX_CONTRACTS_RUT_SOCIEDAD',
            columnNames: ['rut_sociedad'],
          },
          {
            name: 'IDX_CONTRACTS_NOMBRE_COLABORADOR',
            columnNames: ['nombre_colaborador'],
          },
          {
            name: 'IDX_CONTRACTS_CONTRACT_NUMBER',
            columnNames: ['contract_number'],
            isUnique: true,
          },
          {
            name: 'IDX_CONTRACTS_CONTRACT_TYPE',
            columnNames: ['contract_type'],
          },
          {
            name: 'IDX_CONTRACTS_STATUS',
            columnNames: ['status'],
          },
          {
            name: 'IDX_CONTRACTS_START_DATE',
            columnNames: ['start_date'],
          },
          {
            name: 'IDX_CONTRACTS_END_DATE',
            columnNames: ['end_date'],
          },
          {
            name: 'IDX_CONTRACTS_NOMBRE_MANDANTE',
            columnNames: ['nombre_mandante'],
          },
          {
            name: 'IDX_CONTRACTS_DIVISION',
            columnNames: ['division'],
          },
          {
            name: 'IDX_CONTRACTS_AREA',
            columnNames: ['area'],
          },
          {
            name: 'IDX_CONTRACTS_RUT_ADMIN',
            columnNames: ['rut_administrador_contrato'],
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('contracts');
  }
}
