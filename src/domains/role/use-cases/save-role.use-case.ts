import { CreateRoleDto } from '@presentation/dto/role/role.dto';
import { ConflictError } from '@shared/domain/errors';
import { Role } from '@domains/role/entities/role.entity';
import { RoleRepository } from '@domains/role/repositories/role.repository';

export class SaveRoleUseCase {
  constructor(private readonly roleRepository: RoleRepository) {}

  async execute(input: CreateRoleDto): Promise<Role> {
    const existingRole = await this.roleRepository.findByName(input.name);
    if (existingRole) {
      throw new ConflictError('Role already exists');
    }

    const role = new Role(input);
    const savedRole = await this.roleRepository.save(role);
    return savedRole;
  }
}
