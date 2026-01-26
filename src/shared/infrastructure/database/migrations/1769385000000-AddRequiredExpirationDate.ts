import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddRequiredExpirationDate1769385000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add to documents
    await queryRunner.addColumn(
      'documents',
      new TableColumn({
        name: 'required_expiration_date',
        type: 'boolean',
        isNullable: false,
        default: false,
      }),
    );

    // Add to document_models
    await queryRunner.addColumn(
      'document_models',
      new TableColumn({
        name: 'required_expiration_date',
        type: 'boolean',
        isNullable: false,
        default: false,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('document_models', 'required_expiration_date');
    await queryRunner.dropColumn('documents', 'required_expiration_date');
  }
}
