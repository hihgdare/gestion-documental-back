import { Repository } from '@shared/domain/base-entity';
import { Permission } from '../entities/permission.entity';

export interface PermissionRepository extends Repository<Permission> {
  findByName(name: string): Promise<Permission | null>;
  findIn(ids: number[]): Promise<Permission[]>;
}
