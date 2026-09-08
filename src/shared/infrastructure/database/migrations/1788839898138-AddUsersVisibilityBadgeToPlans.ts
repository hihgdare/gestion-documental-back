import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddUsersVisibilityBadgeToPlans1788839898138 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable("plans");

    if (!table?.findColumnByName("max_active_users")) {
      await queryRunner.addColumn(
        "plans",
        new TableColumn({
          name: "max_active_users",
          type: "int",
          isNullable: true,
          comment: "NULL means unlimited",
        }),
      );
    }

    if (!table?.findColumnByName("is_visible")) {
      await queryRunner.addColumn(
        "plans",
        new TableColumn({
          name: "is_visible",
          type: "tinyint",
          default: 1,
          isNullable: false,
          comment: "Whether the plan can be shown on public surfaces like the landing page",
        }),
      );
    }

    if (!table?.findColumnByName("badge")) {
      await queryRunner.addColumn(
        "plans",
        new TableColumn({
          name: "badge",
          type: "varchar",
          length: "20",
          isNullable: true,
          comment: "Highlight tag shown on public pricing surfaces: recommended | popular",
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable("plans");
    if (table?.findColumnByName("badge")) {
      await queryRunner.dropColumn("plans", "badge");
    }
    if (table?.findColumnByName("is_visible")) {
      await queryRunner.dropColumn("plans", "is_visible");
    }
    if (table?.findColumnByName("max_active_users")) {
      await queryRunner.dropColumn("plans", "max_active_users");
    }
  }

}
