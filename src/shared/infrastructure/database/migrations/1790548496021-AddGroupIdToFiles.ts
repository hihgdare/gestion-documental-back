import { TableColumn, TableIndex } from 'typeorm';
import { ImprovedRunner, IQueryRunner } from '../runner';

const FILES_TABLE = 'files';
const GROUP_ID_INDEX = 'IDX_files_group_id';

export class AddGroupIdToFiles1790548496021 extends ImprovedRunner {
  public async onUp(queryRunner: IQueryRunner): Promise<void> {
    if (!(await queryRunner.hasColumn(FILES_TABLE, 'group_id'))) {
      await queryRunner.addColumn(FILES_TABLE, new TableColumn({
        name: 'group_id',
        type: 'int',
        isNullable: true,
        comment: 'Grupo que subió el archivo; cuenta para su cuota de almacenamiento aunque no esté enlazado a un documento.',
      }));
      await queryRunner.createIndex(FILES_TABLE, new TableIndex({
        name: GROUP_ID_INDEX,
        columnNames: ['group_id'],
      }));
    }
  }

  public async onDown(queryRunner: IQueryRunner): Promise<void> {
    if (await queryRunner.hasColumn(FILES_TABLE, 'group_id')) {
      await queryRunner.dropIndex(FILES_TABLE, GROUP_ID_INDEX);
      await queryRunner.dropColumn(FILES_TABLE, 'group_id');
    }
  }
}
