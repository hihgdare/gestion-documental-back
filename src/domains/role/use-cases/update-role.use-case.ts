import { UpdateRoleDto } from '@presentation/dto/role/role.dto';
import { ConflictError, NotFoundError } from '@shared/domain/errors';
import { Role } from '@domains/role/entities/role.entity';
import { RoleRepository } from '@domains/role/repositories/role.repository';

export class UpdateRoleUseCase {
  constructor(private readonly roleRepository: RoleRepository) {}

  async execute(id: number, input: UpdateRoleDto): Promise<Role> {
    const role = await this.roleRepository.findById(id);
    if (!role) {
      throw new NotFoundError(`Role with ID ${id} not found`);
    }

    if (input.name) {
      const existing = await this.roleRepository.findByName(input.name);
      if (existing && existing.id !== id) {
        throw new ConflictError('Role name already taken');
      }
      role.name = input.name;
    }

    if (input.description) {
      role.description = input.description;
    }

    return this.roleRepository.update(id, role);
  }
}

export class DeleteRoleUseCase {
  constructor(private readonly roleRepository: RoleRepository) {}

  async execute(id: number): Promise<void> {
    const role = await this.roleRepository.findById(id);
    if (!role) {
      throw new NotFoundError(`Role with ID ${id} not found`);
    }

    await this.roleRepository.delete(id);
  }
}
