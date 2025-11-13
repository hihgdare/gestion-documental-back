import { Repository } from '@shared/domain/base-entity';
import { Role } from '../entities/role.entity';

export interface RoleRepository extends Repository<Role, number | null> {
  findByName(name: string): Promise<Role | null>;
  findIn(ids: number[]): Promise<Role[]>;
}
