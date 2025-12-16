import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveColaboratorIdFromDocumentsHistoryTable1765914818094 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop the foreign key constraint for colaboratorId
    await queryRunner.query(
      `ALTER TABLE \`documents_history\` DROP FOREIGN KEY \`FK_DOCUMENTS_HISTORY_COLABORATOR\``,
    );

    // Drop the colaboratorId column
    await queryRunner.query(
      `ALTER TABLE \`documents_history\` DROP COLUMN \`colaborator_id\``,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Add back the colaboratorId column
    await queryRunner.query(
      `ALTER TABLE \`documents_history\` ADD COLUMN \`colaborator_id\` varchar(36) NOT NULL`,
    );

    // Add back the foreign key constraint
    await queryRunner.query(
      `ALTER TABLE \`documents_history\` ADD CONSTRAINT \`FK_DOCUMENTS_HISTORY_COLABORATOR\` FOREIGN KEY (\`colaborator_id\`) REFERENCES \`colaborators\`(\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE`,
    );
  }

}
