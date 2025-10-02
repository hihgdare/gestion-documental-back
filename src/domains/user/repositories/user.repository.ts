import { Repository } from '@shared/domain/base-entity';
import { User } from '../entities/user.entity';

export interface UserRepository extends Repository<User> {
  findByEmail(email: string): Promise<User | null>;
  findByStatus(status: string): Promise<User[]>;
  findByRoleId(roleId: string): Promise<User[]>;
  existsByEmail(email: string): Promise<boolean>;
}