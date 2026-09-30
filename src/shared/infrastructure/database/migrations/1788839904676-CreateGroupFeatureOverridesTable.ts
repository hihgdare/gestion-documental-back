import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from "typeorm";

export class CreateGroupFeatureOverridesTable1788839904676 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "group_feature_overrides",
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
            name: "feature_id",
            type: "varchar",
            length: "36",
            isNullable: false,
          },
          {
            name: "granted",
            type: "tinyint",
            isNullable: false,
            comment: "true = feature granted to the group beyond its plan, false = feature revoked despite the plan",
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

    const table = await queryRunner.getTable("group_feature_overrides");

    if (!table?.foreignKeys.find((fk) => fk.name === "FK_GROUP_FEATURE_OVERRIDES_GROUP")) {
      await queryRunner.createForeignKey(
        "group_feature_overrides",
        new TableForeignKey({
          name: "FK_GROUP_FEATURE_OVERRIDES_GROUP",
          columnNames: ["group_id"],
          referencedColumnNames: ["id"],
          referencedTableName: "groups",
          onDelete: "CASCADE",
        }),
      );
    }

    if (!table?.foreignKeys.find((fk) => fk.name === "FK_GROUP_FEATURE_OVERRIDES_FEATURE")) {
      await queryRunner.createForeignKey(
        "group_feature_overrides",
        new TableForeignKey({
          name: "FK_GROUP_FEATURE_OVERRIDES_FEATURE",
          columnNames: ["feature_id"],
          referencedColumnNames: ["id"],
          referencedTableName: "features",
          onDelete: "CASCADE",
        }),
      );
    }

    if (!table?.indices.find((i) => i.name === "IDX_GROUP_FEATURE_OVERRIDES_UNIQUE")) {
      await queryRunner.createIndex(
        "group_feature_overrides",
        new TableIndex({
          name: "IDX_GROUP_FEATURE_OVERRIDES_UNIQUE",
          columnNames: ["group_id", "feature_id"],
          isUnique: true,
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable("group_feature_overrides");
    if (table) {
      const fkGroup = table.foreignKeys.find((fk) => fk.columnNames.includes("group_id"));
      const fkFeature = table.foreignKeys.find((fk) => fk.columnNames.includes("feature_id"));
      if (fkGroup) await queryRunner.dropForeignKey("group_feature_overrides", fkGroup);
      if (fkFeature) await queryRunner.dropForeignKey("group_feature_overrides", fkFeature);
    }
    await queryRunner.dropTable("group_feature_overrides");
  }

}
