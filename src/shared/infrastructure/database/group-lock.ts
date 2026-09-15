import { AppDataSource } from './typeorm.config';

const LOCKABLE_DB_TYPES = new Set(['mysql', 'mariadb']);

export async function withGroupLock<T>(groupId: number, fn: () => Promise<T>): Promise<T> {
  return AppDataSource.transaction(async (manager) => {
    if (LOCKABLE_DB_TYPES.has(AppDataSource.options.type)) {
      await manager.query('SELECT `id` FROM `groups` WHERE `id` = ? FOR UPDATE', [groupId]);
    }
    return fn();
  });
}
