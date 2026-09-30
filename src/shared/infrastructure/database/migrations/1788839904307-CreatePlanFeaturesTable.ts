import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from "typeorm";

export class CreatePlanFeaturesTable1788839904307 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "plan_features",
        columns: [
          {
            name: "plan_id",
            type: "varchar",
            length: "36",
            isPrimary: true,
          },
          {
            name: "feature_id",
            type: "varchar",
            length: "36",
            isPrimary: true,
          },
        ],
      }),
      true,
    );

    const table = await queryRunner.getTable("plan_features");

    if (!table?.foreignKeys.find((fk) => fk.name === "FK_PLAN_FEATURES_PLAN")) {
      await queryRunner.createForeignKey(
        "plan_features",
        new TableForeignKey({
          name: "FK_PLAN_FEATURES_PLAN",
          columnNames: ["plan_id"],
          referencedColumnNames: ["id"],
          referencedTableName: "plans",
          onDelete: "CASCADE",
        }),
      );
    }

    if (!table?.foreignKeys.find((fk) => fk.name === "FK_PLAN_FEATURES_FEATURE")) {
      await queryRunner.createForeignKey(
        "plan_features",
        new TableForeignKey({
          name: "FK_PLAN_FEATURES_FEATURE",
          columnNames: ["feature_id"],
          referencedColumnNames: ["id"],
          referencedTableName: "features",
          onDelete: "CASCADE",
        }),
      );
    }

    if (!table?.indices.find((i) => i.name === "IDX_PLAN_FEATURES_FEATURE_ID")) {
      await queryRunner.createIndex(
        "plan_features",
        new TableIndex({
          name: "IDX_PLAN_FEATURES_FEATURE_ID",
          columnNames: ["feature_id"],
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable("plan_features");
    if (table) {
      const fkPlan = table.foreignKeys.find((fk) => fk.columnNames.includes("plan_id"));
      const fkFeature = table.foreignKeys.find((fk) => fk.columnNames.includes("feature_id"));
      if (fkPlan) await queryRunner.dropForeignKey("plan_features", fkPlan);
      if (fkFeature) await queryRunner.dropForeignKey("plan_features", fkFeature);
    }
    await queryRunner.dropTable("plan_features");
  }

}
