import { Repository } from '@shared/domain/base-entity';
import { User } from '../entities/user.entity';
import { UserStatus } from '../value-objects/user-status';

export interface UserRepository extends Repository<User> {
  findByEmail(email: string): Promise<User | null>;
  findByStatus(status: UserStatus): Promise<User[]>;
  findByRoleId(roleId: string): Promise<User[]>;
  existsByEmail(email: string): Promise<boolean>;
}
