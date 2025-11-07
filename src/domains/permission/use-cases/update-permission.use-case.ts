import { UpdatePermissionDto } from '@presentation/dto/permission/permission.dto';
import { Permission } from '../entities/permission.entity';
import { PermissionRepository } from '../repositories/permission.repository';

export class UpdatePermissionUseCase {
  constructor(private readonly permissionRepository: PermissionRepository) {}

  async execute(id: number, input: UpdatePermissionDto): Promise<Permission> {
    const permission = await this.permissionRepository.findById(id);
    if (!permission) {
      throw new Error('Permission not found');
    }

    if (input.name) {
      const existing = await this.permissionRepository.findByName(input.name);
      if (existing && existing.id !== id) {
        throw new Error('Permission name already taken');
      }
      permission.name = input.name;
    }

    if (input.description) {
      permission.description = input.description;
    }

    return this.permissionRepository.update(permission);
  }
}
