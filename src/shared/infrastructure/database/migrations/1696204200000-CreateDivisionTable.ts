import { Table } from "typeorm";
import { ImprovedRunner, IQueryRunner } from "../runner";

export class CreateDivisionTable1696204200000 extends ImprovedRunner {

  public async onUp(queryRunner: IQueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: "divisions",
      columns: [
        {
          name: "id",
          type: "varchar",
          length: "36",
          isPrimary: true,
          isGenerated: true,
          generationStrategy: "uuid",
        },
        {
          name: "name",
          type: "varchar",
          length: "255",
          isNullable: false,
        },
        {
          name: "description",
          type: "text",
          isNullable: true,
        },
        {
          name: "group_id",
          type: "int",
          isNullable: false,
        },
        {
          name: "area_id",
          type: "varchar",
          length: "36",
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
      foreignKeys: [
        {
          name: "FK_DIVISIONS_GROUP_ID",
          columnNames: ["group_id"],
          referencedTableName: "groups",
          referencedColumnNames: ["id"],
          onDelete: "CASCADE",
        },
        {
          name: "FK_DIVISIONS_AREA_ID",
          columnNames: ["area_id"],
          referencedTableName: "areas",
          referencedColumnNames: ["id"],
          onDelete: "CASCADE",
        },
      ],
    }));
  }

  public async onDown(queryRunner: IQueryRunner): Promise<void> {
    await queryRunner.dropTable("divisions");
  }

}

