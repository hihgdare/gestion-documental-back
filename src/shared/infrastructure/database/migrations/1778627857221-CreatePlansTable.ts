import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreatePlansTable1778627857221 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "plans",
        columns: [
          {
            name: "id",
            type: "varchar",
            length: "36",
            isPrimary: true,
          },
          {
            name: "name",
            type: "varchar",
            length: "100",
            isUnique: true,
            isNullable: false,
          },
          {
            name: "max_active_colaborators",
            type: "int",
            isNullable: true,
            comment: "NULL means unlimited",
          },
          {
            name: "max_active_contracts",
            type: "int",
            isNullable: true,
            comment: "NULL means unlimited",
          },
          {
            name: "max_documents",
            type: "int",
            isNullable: true,
            comment: "NULL means unlimited",
          },
          {
            name: "created_at",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          },
          {
            name: "updated_at",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
            onUpdate: "CURRENT_TIMESTAMP",
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("plans");
  }

}
