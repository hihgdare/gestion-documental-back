import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddStorageGbToPlans1779834828634 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "plans",
      new TableColumn({
        name: "max_storage_gb",
        type: "int",
        isNullable: true,
        comment: "NULL means unlimited",
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("plans", "max_storage_gb");
  }

}
