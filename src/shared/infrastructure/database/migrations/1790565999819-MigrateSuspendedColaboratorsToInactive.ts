import { ImprovedRunner, IQueryRunner } from '../runner';

export class MigrateSuspendedColaboratorsToInactive1790565999819 extends ImprovedRunner {
  public async onUp(queryRunner: IQueryRunner): Promise<void> {
    await queryRunner.query(`UPDATE colaborators SET status = 'inactivo' WHERE status = 'suspendido'`);
  }

  public async onDown(): Promise<void> {}
}
