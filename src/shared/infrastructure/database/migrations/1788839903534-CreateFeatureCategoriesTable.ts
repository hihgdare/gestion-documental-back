import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class CreateFeatureCategoriesTable1788839903534 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "feature_categories",
        columns: [
          {
            name: "id",
            type: "varchar",
            length: "36",
            isPrimary: true,
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

    const table = await queryRunner.getTable("feature_categories");
    if (!table?.indices.find((i) => i.name === "IDX_FEATURE_CATEGORIES_KEY")) {
      await queryRunner.createIndex(
        "feature_categories",
        new TableIndex({
          name: "IDX_FEATURE_CATEGORIES_KEY",
          columnNames: ["key"],
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("feature_categories");
  }

}
