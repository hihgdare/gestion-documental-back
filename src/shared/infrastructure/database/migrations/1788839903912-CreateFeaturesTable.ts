import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from "typeorm";

export class CreateFeaturesTable1788839903912 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "features",
        columns: [
          {
            name: "id",
            type: "varchar",
            length: "36",
            isPrimary: true,
          },
          {
            name: "category_id",
            type: "varchar",
            length: "36",
            isNullable: false,
          },
          {
            name: "key",
            type: "varchar",
            length: "100",
            isUnique: true,
          },
          {
            name: "name",
            type: "varchar",
            length: "150",
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

    const table = await queryRunner.getTable("features");

    if (!table?.foreignKeys.find((fk) => fk.name === "FK_FEATURES_CATEGORY")) {
      await queryRunner.createForeignKey(
        "features",
        new TableForeignKey({
          name: "FK_FEATURES_CATEGORY",
          columnNames: ["category_id"],
          referencedColumnNames: ["id"],
          referencedTableName: "feature_categories",
          onDelete: "CASCADE",
        }),
      );
    }

    if (!table?.indices.find((i) => i.name === "IDX_FEATURES_CATEGORY_ID")) {
      await queryRunner.createIndex(
        "features",
        new TableIndex({
          name: "IDX_FEATURES_CATEGORY_ID",
          columnNames: ["category_id"],
        }),
      );
    }

    if (!table?.indices.find((i) => i.name === "IDX_FEATURES_KEY")) {
      await queryRunner.createIndex(
        "features",
        new TableIndex({
          name: "IDX_FEATURES_KEY",
          columnNames: ["key"],
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable("features");
    if (table) {
      const fkCategory = table.foreignKeys.find((fk) => fk.columnNames.includes("category_id"));
      if (fkCategory) await queryRunner.dropForeignKey("features", fkCategory);
    }
    await queryRunner.dropTable("features");
  }

}
