import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateContractTemplatesTable1764810001000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'contract_templates',
        columns: [
          { name: 'id', type: 'varchar', length: '36', isPrimary: true },
          { name: 'contract_id', type: 'varchar', length: '36', isNullable: false },
          { name: 'document_template_id', type: 'varchar', length: '36', isNullable: false },
          { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP', isNullable: false },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'contract_templates',
      new TableForeignKey({
        name: 'FK_CONTRACT_TEMPLATES_CONTRACT',
        columnNames: ['contract_id'],
        referencedTableName: 'contracts',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'contract_templates',
      new TableForeignKey({
        name: 'FK_CONTRACT_TEMPLATES_DOCUMENT_TEMPLATE',
        columnNames: ['document_template_id'],
        referencedTableName: 'document_templates',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    await queryRunner.createIndex(
      'contract_templates',
      new TableIndex({ name: 'IDX_CONTRACT_TEMPLATES_CONTRACT_ID', columnNames: ['contract_id'] }),
    );

    await queryRunner.createIndex(
      'contract_templates',
      new TableIndex({ name: 'IDX_CONTRACT_TEMPLATES_DOCUMENT_TEMPLATE_ID', columnNames: ['document_template_id'] }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('contract_templates');
    if (table) {
      // Drop Foreign Keys first
      const fkDocT = table.foreignKeys.find(f => f.name === 'FK_CONTRACT_TEMPLATES_DOCUMENT_TEMPLATE' || f.columnNames.includes('document_template_id'));
      if (fkDocT) {
        await queryRunner.dropForeignKey('contract_templates', fkDocT);
      }
      const fkContract = table.foreignKeys.find(f => f.name === 'FK_CONTRACT_TEMPLATES_CONTRACT' || f.columnNames.includes('contract_id'));
      if (fkContract) {
        await queryRunner.dropForeignKey('contract_templates', fkContract);
      }

      // Drop Indices
      const hasIdxDocT = table.indices.some(i => i.name === 'IDX_CONTRACT_TEMPLATES_DOCUMENT_TEMPLATE_ID');
      if (hasIdxDocT) {
        await queryRunner.dropIndex('contract_templates', 'IDX_CONTRACT_TEMPLATES_DOCUMENT_TEMPLATE_ID');
      }
      const hasIdxContract = table.indices.some(i => i.name === 'IDX_CONTRACT_TEMPLATES_CONTRACT_ID');
      if (hasIdxContract) {
        await queryRunner.dropIndex('contract_templates', 'IDX_CONTRACT_TEMPLATES_CONTRACT_ID');
      }
    }
    if (await queryRunner.getTable('contract_templates')) {
      await queryRunner.dropTable('contract_templates');
    }
  }
}
