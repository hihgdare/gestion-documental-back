import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeColaboratorDocumentUniqueToPerGroup1774327068359 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop global unique index on numero_documento and replace with per-group composite
    await queryRunner.query(`DROP INDEX \`IDX_a09ad8dbb6f626ff6ac25c3f6e\` ON \`colaborators\``);
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`IDX_colaborators_numero_documento_group_id\` ON \`colaborators\` (\`numero_documento\`, \`group_id\`)`,
    );

    // Drop global unique index on email (find name dynamically) and replace with per-group composite
    const [emailIdxRows]: [Array<{ INDEX_NAME: string }>] = await queryRunner.query(`
      SELECT INDEX_NAME FROM INFORMATION_SCHEMA.STATISTICS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'colaborators'
        AND COLUMN_NAME = 'email'
        AND NON_UNIQUE = 0
        AND INDEX_NAME != 'IDX_colaborators_email_group_id'
    `);
    if (emailIdxRows?.length) {
      await queryRunner.query(`DROP INDEX \`${emailIdxRows[0].INDEX_NAME}\` ON \`colaborators\``);
    }
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`IDX_colaborators_email_group_id\` ON \`colaborators\` (\`email\`, \`group_id\`)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Restore global unique index on email
    await queryRunner.query(`DROP INDEX \`IDX_colaborators_email_group_id\` ON \`colaborators\``);
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`IDX_6e9a8b6a4bb8b4a6f3bd41d2eb\` ON \`colaborators\` (\`email\`)`,
    );

    // Restore global unique index on numero_documento
    await queryRunner.query(`DROP INDEX \`IDX_colaborators_numero_documento_group_id\` ON \`colaborators\``);
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`IDX_a09ad8dbb6f626ff6ac25c3f6e\` ON \`colaborators\` (\`numero_documento\`)`,
    );
  }
}
