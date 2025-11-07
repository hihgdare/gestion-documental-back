import { Permission } from '../entities/permission.entity';

export interface PermissionRepository {
  create(permission: Permission): Promise<Permission>;
  findByName(name: string): Promise<Permission | null>;
  findById(id: number): Promise<Permission | null>;
  findAll(): Promise<Permission[]>;
  update(permission: Permission): Promise<Permission>;
  delete(id: number): Promise<void>;
}
