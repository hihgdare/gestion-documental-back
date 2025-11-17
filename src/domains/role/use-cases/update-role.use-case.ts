import { ConflictError, NotFoundError } from '@shared/domain/errors';
import { Role, UpdateRoleProps } from '@domains/role/entities/role.entity';
import { RoleRepository } from '@domains/role/repositories/role.repository';

export class UpdateRoleUseCase {
  constructor(private readonly roleRepository: RoleRepository) {}

  async execute(props: UpdateRoleProps): Promise<Role> {
    const role = await this.roleRepository.findById(props.id);
    if (!role) {
      throw new NotFoundError(`Role with ID ${props.id} not found`);
    }

    if (props.name) {
      const existing = await this.roleRepository.findByName(props.name);
      if (existing && existing.id !== props.id) {
        throw new ConflictError('Role name already taken');
      }
    }

    return this.roleRepository.update(props);
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
