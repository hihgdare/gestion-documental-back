import { AsyncLocalStorage } from 'async_hooks';
import { DataSource } from 'typeorm';
import { ConflictError } from '@shared/domain/errors';
import { GroupLockRunner } from '@shared/domain/group-lock';

const LOCKABLE_DB_TYPES = new Set(['mysql', 'mariadb']);
const LOCK_TIMEOUT_SECONDS = 30;
const DEFAULT_POOL_SIZE = 10;

class Semaphore {
  private available: number;
  private readonly waiters: (() => void)[] = [];

  constructor(capacity: number) {
    this.available = capacity;
  }

  async acquire(): Promise<void> {
    if (this.available > 0) {
      this.available--;
      return;
    }
    await new Promise<void>((resolve) => this.waiters.push(resolve));
  }

  release(): void {
    const next = this.waiters.shift();
    if (next) {
      next();
    } else {
      this.available++;
    }
  }
}

function resolvePoolSize(dataSource: DataSource): number {
  const { poolSize, extra } = dataSource.options as { poolSize?: number; extra?: { connectionLimit?: number } };
  return poolSize ?? extra?.connectionLimit ?? DEFAULT_POOL_SIZE;
}

export function createMySqlGroupLock(dataSource: DataSource): GroupLockRunner {
  if (!LOCKABLE_DB_TYPES.has(dataSource.options.type)) {
    return (_groupId, fn) => fn();
  }

  const heldGroups = new AsyncLocalStorage<Set<number>>();
  const localQueues = new Map<number, Promise<unknown>>();
  const lockConnections = new Semaphore(Math.max(1, Math.floor(resolvePoolSize(dataSource) / 2)));

  const acquireDatabaseLock = async <T>(groupId: number, fn: () => Promise<T>): Promise<T> => {
    await lockConnections.acquire();
    try {
      const lockName = `group-lock:${groupId}`;
      const queryRunner = dataSource.createQueryRunner();
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
    } finally {
      lockConnections.release();
    }
  };

  const runInLocalQueue = <T>(groupId: number, task: () => Promise<T>): Promise<T> => {
    const previous = localQueues.get(groupId) ?? Promise.resolve();
    const current = previous.then(task);
    const tail = current.catch(() => undefined);
    localQueues.set(groupId, tail);
    void tail.then(() => {
      if (localQueues.get(groupId) === tail) localQueues.delete(groupId);
    });
    return current;
  };

  return <T>(groupId: number, fn: () => Promise<T>): Promise<T> => {
    const held = heldGroups.getStore();
    if (held?.has(groupId)) {
      return fn();
    }

    const nextHeld = new Set(held ?? []).add(groupId);
    return runInLocalQueue(groupId, () =>
      acquireDatabaseLock(groupId, () => heldGroups.run(nextHeld, fn)),
    );
  };
}
