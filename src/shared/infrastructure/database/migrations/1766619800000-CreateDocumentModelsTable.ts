import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateDocumentModelsTable1766619800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'document_models',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'family_id',
            type: 'varchar',
            length: '36',
            isNullable: false,
          },
          {
            name: 'document_type_id',
            type: 'varchar',
            length: '36',
            isNullable: false,
          },
          {
            name: 'document_subtype_id',
            type: 'varchar',
            length: '36',
            isNullable: false,
          },
          {
            name: 'required_for_contract',
            type: 'boolean',
            isNullable: false,
            default: false,
          },
          {
            name: 'required_for_colaborator',
            type: 'boolean',
            isNullable: false,
            default: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
            default: null,
          },
        ],
        indices: [
          {
            name: 'IDX_DOCUMENT_MODELS_FAMILY_ID',
            columnNames: ['family_id'],
          },
          {
            name: 'IDX_DOCUMENT_MODELS_TYPE_SUBTYPE',
            columnNames: ['document_type_id', 'document_subtype_id'],
          },
        ],
      }),
      true,
    );

    // Foreign key hacia families
    await queryRunner.createForeignKey(
      'document_models',
      new TableForeignKey({
        columnNames: ['family_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'families',
        onDelete: 'CASCADE',
        name: 'FK_DOCUMENT_MODELS_FAMILY',
      }),
    );

    // Foreign key hacia document_types
    await queryRunner.createForeignKey(
      'document_models',
      new TableForeignKey({
        columnNames: ['document_type_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'document_types',
        onDelete: 'RESTRICT',
        name: 'FK_DOCUMENT_MODELS_TYPE',
      }),
    );

    // Foreign key hacia document_subtypes
    await queryRunner.createForeignKey(
      'document_models',
      new TableForeignKey({
        columnNames: ['document_subtype_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'document_subtypes',
        onDelete: 'RESTRICT',
        name: 'FK_DOCUMENT_MODELS_SUBTYPE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('document_models', 'FK_DOCUMENT_MODELS_SUBTYPE');
    await queryRunner.dropForeignKey('document_models', 'FK_DOCUMENT_MODELS_TYPE');
    await queryRunner.dropForeignKey('document_models', 'FK_DOCUMENT_MODELS_FAMILY');
    await queryRunner.dropTable('document_models');
  }
}
