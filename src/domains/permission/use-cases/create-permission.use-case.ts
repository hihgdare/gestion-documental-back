import { CreatePermissionDto } from '@presentation/dto/permission/permission.dto';
import { ConflictError } from '@shared/domain/errors';
import { Permission } from '../entities/permission.entity';
import { PermissionRepository } from '../repositories/permission.repository';

export class CreatePermissionUseCase {
  constructor(private readonly permissionRepository: PermissionRepository) {}

  async execute(input: CreatePermissionDto): Promise<Permission> {
    const existingPermission = await this.permissionRepository.findByName(input.name);
    if (existingPermission) {
      throw new ConflictError('Permission already exists');
    }

    const permission = new Permission(input);
    return this.permissionRepository.create(permission);
  }
}
