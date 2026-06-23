import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRequiresSignatureToDocumentModel1782192753247 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "document_models" ADD COLUMN "requires_signature" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "document_models" DROP COLUMN "requires_signature"`,
    );
  }

}
