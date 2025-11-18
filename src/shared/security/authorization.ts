import { AppDataSource } from '@shared/infrastructure/database/typeorm.config';
import { UserEntity } from '@shared/infrastructure/database/entities/user.entity';
import { RoleEntity } from '@shared/infrastructure/database/entities/role.entity';
import { PermissionCache } from '@shared/infrastructure/cache/permission.cache';

const cache = new PermissionCache(60);

export async function getUserEffectivePermissions(userId: string): Promise<Set<string>> {
  if (process.env.NODE_ENV !== 'test') {
    const cached = cache.get(userId);
    if (cached) return cached;
  }

  const userRepo = AppDataSource.getRepository(UserEntity);
  const user = await userRepo.findOne({
    where: { id: userId },
    relations: [
      'roles',
      'roles.permissions',
      'roles.parent',
      'roles.parent.permissions',
    ],
  });
  const names = new Set<string>();
  if (!user) return names;

  for (const role of user.roles || []) {
    collectRolePermissions(role, names);
  }
  if (process.env.NODE_ENV !== 'test') {
    cache.set(userId, names);
  }
  return names;
}

function collectRolePermissions(role: RoleEntity, out: Set<string>): void {
  for (const p of role.permissions || []) out.add(p.name);
  if (role.parent) {
    collectRolePermissions(role.parent, out);
  }
}

export function clearPermissionCache(userId?: string): void {
  cache.clear(userId);
}
