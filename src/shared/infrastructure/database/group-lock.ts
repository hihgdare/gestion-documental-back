import { AppDataSource } from './typeorm.config';
import { ConflictError } from '@shared/domain/errors';

const LOCKABLE_DB_TYPES = new Set(['mysql', 'mariadb']);
const LOCK_TIMEOUT_SECONDS = 30;

export async function withGroupLock<T>(groupId: number, fn: () => Promise<T>): Promise<T> {
  if (!LOCKABLE_DB_TYPES.has(AppDataSource.options.type)) {
    return fn();
  }

  const lockName = `group-lock:${groupId}`;
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();

  try {
    const [{ acquired }] = await queryRunner.query('SELECT GET_LOCK(?, ?) AS acquired', [lockName, LOCK_TIMEOUT_SECONDS]);
    if (Number(acquired) !== 1) {
      throw new ConflictError('Hay otra operación en curso para este grupo. Inténtalo de nuevo en unos segundos.');
    }

    try {
      return await fn();
    } finally {
      await queryRunner.query('SELECT RELEASE_LOCK(?)', [lockName]);
    }
  } finally {
    await queryRunner.release();
  }
}
