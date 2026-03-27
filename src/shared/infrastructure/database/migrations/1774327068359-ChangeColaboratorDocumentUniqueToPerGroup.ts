import { TableIndex } from 'typeorm';
import { IQueryRunner, ImprovedRunner } from '../runner';

export class ChangeColaboratorDocumentUniqueToPerGroup1774327068359 extends ImprovedRunner {

  public async onUp(queryRunner: IQueryRunner): Promise<void> {
    const table = 'colaborators';

    // Drop global unique index on numero_documento (if still present) and replace with per-group composite
    await queryRunner.dropIndex(table, 'IDX_a09ad8dbb6f626ff6ac25c3f6e');
    await queryRunner.createIndex(table, new TableIndex({
      name: 'IDX_colaborators_numero_documento_group_id',
      columnNames: ['numero_documento', 'group_id'],
      isUnique: true,
    }));

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
      await queryRunner.dropIndex(table, emailIdxRows[0].INDEX_NAME);
    }
    await queryRunner.createIndex(table, new TableIndex({
      name: 'IDX_colaborators_email_group_id',
      columnNames: ['email', 'group_id'],
      isUnique: true,
    }));
  }

  public async onDown(queryRunner: IQueryRunner): Promise<void> {
    const table = 'colaborators';

    // Restore global unique index on email
    await queryRunner.dropIndex(table, 'IDX_colaborators_email_group_id');
    await queryRunner.createIndex(table, new TableIndex({
      name: 'IDX_6e9a8b6a4bb8b4a6f3bd41d2eb',
      columnNames: ['email'],
      isUnique: true,
    }));

    // Restore global unique index on numero_documento
    await queryRunner.dropIndex(table, 'IDX_colaborators_numero_documento_group_id');
    await queryRunner.createIndex(table, new TableIndex({
      name: 'IDX_a09ad8dbb6f626ff6ac25c3f6e',
      columnNames: ['numero_documento'],
      isUnique: true,
    }));
  }
}
