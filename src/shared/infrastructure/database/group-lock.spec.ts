import { describe, it, expect, afterEach } from 'bun:test';
import { DataSource } from 'typeorm';
import { createMySqlGroupLock } from './group-lock';
import { configureGroupLock, withGroupLock } from '@shared/domain/group-lock';
import { ConflictError } from '@shared/domain/errors';

interface FakeDatabase {
  dataSource: DataSource;
  openConnections: () => number;
  maxOpenConnections: () => number;
  releasedLocks: string[];
}

function createFakeDatabase(options: { poolSize?: number; acquired?: number } = {}): FakeDatabase {
  let open = 0;
  let maxOpen = 0;
  const releasedLocks: string[] = [];

  const dataSource = {
    options: { type: 'mysql', poolSize: options.poolSize ?? 10 },
    createQueryRunner: () => ({
      connect: async () => {
        open++;
        maxOpen = Math.max(maxOpen, open);
      },
      release: async () => {
        open--;
      },
      query: async (sql: string, params: unknown[]) => {
        if (sql.startsWith('SELECT GET_LOCK')) return [{ acquired: options.acquired ?? 1 }];
        releasedLocks.push(String(params[0]));
        return [];
      },
    }),
  } as unknown as DataSource;

  return { dataSource, openConnections: () => open, maxOpenConnections: () => maxOpen, releasedLocks };
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('createMySqlGroupLock', () => {
  it('ejecuta la función sin lock en bases de datos que no son MySQL', async () => {
    const lock = createMySqlGroupLock({ options: { type: 'sqljs' } } as unknown as DataSource);
    expect(await lock(1, async () => 'ok')).toBe('ok');
  });

  it('serializa las operaciones del mismo grupo', async () => {
    const { dataSource } = createFakeDatabase();
    const lock = createMySqlGroupLock(dataSource);
    const events: string[] = [];

    await Promise.all([
      lock(1, async () => { events.push('a:start'); await delay(10); events.push('a:end'); }),
      lock(1, async () => { events.push('b:start'); await delay(1); events.push('b:end'); }),
    ]);

    expect(events).toEqual(['a:start', 'a:end', 'b:start', 'b:end']);
  });

  it('permite operaciones concurrentes en grupos distintos', async () => {
    const { dataSource } = createFakeDatabase();
    const lock = createMySqlGroupLock(dataSource);
    const events: string[] = [];

    await Promise.all([
      lock(1, async () => { events.push('1:start'); await delay(10); events.push('1:end'); }),
      lock(2, async () => { events.push('2:start'); await delay(1); events.push('2:end'); }),
    ]);

    expect(events.indexOf('2:start')).toBeLessThan(events.indexOf('1:end'));
  });

  it('usa como máximo la mitad del pool para mantener locks', async () => {
    const database = createFakeDatabase({ poolSize: 4 });
    const lock = createMySqlGroupLock(database.dataSource);

    await Promise.all([1, 2, 3, 4, 5, 6].map((groupId) => lock(groupId, () => delay(5))));

    expect(database.maxOpenConnections()).toBe(2);
    expect(database.openConnections()).toBe(0);
  });

  it('no se bloquea con un lock anidado del mismo grupo', async () => {
    const { dataSource } = createFakeDatabase();
    const lock = createMySqlGroupLock(dataSource);

    const result = await lock(1, () => lock(1, async () => 'anidado'));

    expect(result).toBe('anidado');
  });

  it('lanza ConflictError si no obtiene el lock', async () => {
    const database = createFakeDatabase({ acquired: 0 });
    const lock = createMySqlGroupLock(database.dataSource);

    await expect(lock(1, async () => 'ok')).rejects.toThrow(ConflictError);
    expect(database.openConnections()).toBe(0);
  });

  it('libera el lock y la conexión aunque la función falle', async () => {
    const database = createFakeDatabase();
    const lock = createMySqlGroupLock(database.dataSource);

    await expect(lock(7, async () => { throw new Error('falla'); })).rejects.toThrow('falla');

    expect(database.releasedLocks).toEqual(['group-lock:7']);
    expect(database.openConnections()).toBe(0);
    expect(await lock(7, async () => 'siguiente')).toBe('siguiente');
  });
});

describe('withGroupLock', () => {
  afterEach(() => {
    configureGroupLock((_groupId, fn) => fn());
  });

  it('delega en la implementación configurada', async () => {
    const calls: number[] = [];
    configureGroupLock((groupId, fn) => {
      calls.push(groupId);
      return fn();
    });

    expect(await withGroupLock(3, async () => 'ok')).toBe('ok');
    expect(calls).toEqual([3]);
  });
});
