import { CreateRoleDto } from '@presentation/dto/role/role.dto';
import { ConflictError } from '@shared/domain/errors';
import { Role } from '../entities/role.entity';
import { RoleRepository } from '../repositories/role.repository';

export class CreateRoleUseCase {
  constructor(private readonly roleRepository: RoleRepository) {}

  async execute(input: CreateRoleDto): Promise<Role> {
    const existingRole = await this.roleRepository.findByName(input.name);
    if (existingRole) {
      throw new ConflictError('Role already exists');
    }

    const role = new Role(input);
    return this.roleRepository.create(role);
  }
}
