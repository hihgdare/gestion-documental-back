import { Role } from '../entities/role.entity';

export interface RoleRepository {
  create(role: Role): Promise<Role>;
  findByName(name: string): Promise<Role | null>;
  findById(id: number): Promise<Role | null>;
  findAll(): Promise<Role[]>;
  update(role: Role): Promise<Role>;
  delete(id: number): Promise<void>;
}
