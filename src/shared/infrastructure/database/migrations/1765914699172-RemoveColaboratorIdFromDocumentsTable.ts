import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveColaboratorIdFromDocumentsTable1765914699172 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop the old unique index that included colaboratorId
    await queryRunner.query(
      `ALTER TABLE \`documents\` DROP INDEX \`UQ_DOCUMENTS_TEMPLATE_CONTRACT_COLABORATOR\``,
    );

    // Drop the foreign key constraint for colaboratorId
    await queryRunner.query(
      `ALTER TABLE \`documents\` DROP FOREIGN KEY \`FK_DOCUMENTS_COLABORATOR\``,
    );

    // Drop the colaboratorId column
    await queryRunner.query(
      `ALTER TABLE \`documents\` DROP COLUMN \`colaborator_id\``,
    );

    // Add a new unique index without colaboratorId (if needed for template + contract combo)
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`UQ_documents_template_contract\` ON \`documents\` (\`template_id\`, \`contract_id\`)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the new unique index
    await queryRunner.query(
      `ALTER TABLE \`documents\` DROP INDEX \`UQ_documents_template_contract\``,
    );

    // Add back the colaboratorId column
    await queryRunner.query(
      `ALTER TABLE \`documents\` ADD COLUMN \`colaborator_id\` varchar(36) NOT NULL`,
    );

    // Add back the foreign key constraint
    await queryRunner.query(
      `ALTER TABLE \`documents\` ADD CONSTRAINT \`FK_DOCUMENTS_COLABORATOR\` FOREIGN KEY (\`colaborator_id\`) REFERENCES \`colaborators\`(\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE`,
    );

    // Restore the old unique index
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`UQ_DOCUMENTS_TEMPLATE_CONTRACT_COLABORATOR\` ON \`documents\` (\`template_id\`, \`contract_id\`, \`colaborator_id\`)`,
    );
  }
}
