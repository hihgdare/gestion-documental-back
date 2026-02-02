import { Table } from "typeorm";
import { ImprovedRunner, IQueryRunner } from "../runner";

export class CreateGroupUsersTable1696202200000 extends ImprovedRunner {

  public async onUp(queryRunner: IQueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: "group_users",
      columns: [
        {
          name: "group_id",
          type: "int",
        },
        {
          name: "user_id",
          type: "varchar",
          length: "36",
        },
        {
          name: "created_at",
          type: "timestamp",
          default: "CURRENT_TIMESTAMP",
        },
      ],
      indices: [
        { name: "IDX_GROUP_USERS_GROUP_ID", columnNames: ["group_id"] },
        { name: "IDX_GROUP_USERS_USER_ID", columnNames: ["user_id"], isUnique: true },
      ],
      foreignKeys: [
        {
          name: "FK_GROUP_USERS_GROUP",
          columnNames: ["group_id"],
          referencedColumnNames: ["id"],
          referencedTableName: "groups",
          onDelete: "CASCADE",
        },
        {
          name: "FK_GROUP_USERS_USER",
          columnNames: ["user_id"],
          referencedColumnNames: ["id"],
          referencedTableName: "users",
          onDelete: "CASCADE",
        },
      ],
    }));
  }

  public async onDown(queryRunner: IQueryRunner): Promise<void> {
    await queryRunner.dropTable("group_users");
  }

}
