import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from "typeorm";

export class CreateGroupPlansTable1778627870449 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "group_plans",
        columns: [
          {
            name: "id",
            type: "varchar",
            length: "36",
            isPrimary: true,
          },
          {
            name: "group_id",
            type: "int",
            isNullable: false,
          },
          {
            name: "plan_id",
            type: "varchar",
            length: "36",
            isNullable: false,
          },
          {
            name: "starts_at",
            type: "timestamp",
            isNullable: false,
            default: "CURRENT_TIMESTAMP",
          },
          {
            name: "ends_at",
            type: "timestamp",
            isNullable: true,
            comment: "NULL means no expiration",
          },
          {
            name: "is_active",
            type: "tinyint",
            default: 1,
            isNullable: false,
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

    const table = await queryRunner.getTable("group_plans");

    if (!table?.foreignKeys.find((fk) => fk.name === "FK_GROUP_PLANS_GROUP")) {
      await queryRunner.createForeignKey(
        "group_plans",
        new TableForeignKey({
          name: "FK_GROUP_PLANS_GROUP",
          columnNames: ["group_id"],
          referencedColumnNames: ["id"],
          referencedTableName: "groups",
          onDelete: "CASCADE",
        }),
      );
    }

    if (!table?.foreignKeys.find((fk) => fk.name === "FK_GROUP_PLANS_PLAN")) {
      await queryRunner.createForeignKey(
        "group_plans",
        new TableForeignKey({
          name: "FK_GROUP_PLANS_PLAN",
          columnNames: ["plan_id"],
          referencedColumnNames: ["id"],
          referencedTableName: "plans",
          onDelete: "RESTRICT",
        }),
      );
    }

    if (!table?.indices.find((i) => i.name === "IDX_GROUP_PLANS_GROUP_ID")) {
      await queryRunner.createIndex(
        "group_plans",
        new TableIndex({
          name: "IDX_GROUP_PLANS_GROUP_ID",
          columnNames: ["group_id"],
        }),
      );
    }

    if (!table?.indices.find((i) => i.name === "IDX_GROUP_PLANS_PLAN_ID")) {
      await queryRunner.createIndex(
        "group_plans",
        new TableIndex({
          name: "IDX_GROUP_PLANS_PLAN_ID",
          columnNames: ["plan_id"],
        }),
      );
    }

    if (!table?.indices.find((i) => i.name === "IDX_GROUP_PLANS_IS_ACTIVE")) {
      await queryRunner.createIndex(
        "group_plans",
        new TableIndex({
          name: "IDX_GROUP_PLANS_IS_ACTIVE",
          columnNames: ["is_active"],
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable("group_plans");
    if (table) {
      const fkGroup = table.foreignKeys.find((fk) => fk.columnNames.includes("group_id"));
      const fkPlan = table.foreignKeys.find((fk) => fk.columnNames.includes("plan_id"));
      if (fkGroup) await queryRunner.dropForeignKey("group_plans", fkGroup);
      if (fkPlan) await queryRunner.dropForeignKey("group_plans", fkPlan);
    }
    await queryRunner.dropTable("group_plans");
  }

}
