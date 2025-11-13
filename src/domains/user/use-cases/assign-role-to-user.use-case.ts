import { UserRepository } from '../repositories/user.repository';
import { RoleRepository } from '../../role/repositories/role.repository';
import { User } from '../entities/user.entity';

export class AssignRoleToUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly roleRepository: RoleRepository,
  ) {}

  async execute(input: { userId: string; roleIds: number[] }): Promise<User> {
    const user = await this.userRepository.findById(input.userId);
    if (!user) {
      throw new Error('User not found');
    }

    const roles = await this.roleRepository.findIn(input.roleIds);

    if (!roles || roles.length !== input.roleIds.length) {
      throw new Error('One or more roles not found');
    }

    user.assignRoles(roles);

    return this.userRepository.update(user.id, user);
  }
}
