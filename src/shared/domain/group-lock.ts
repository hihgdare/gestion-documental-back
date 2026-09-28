export type GroupLockRunner = <T>(groupId: number, fn: () => Promise<T>) => Promise<T>;

let runner: GroupLockRunner = (_groupId, fn) => fn();

export function configureGroupLock(groupLockRunner: GroupLockRunner): void {
  runner = groupLockRunner;
}

export function withGroupLock<T>(groupId: number, fn: () => Promise<T>): Promise<T> {
  return runner(groupId, fn);
}
