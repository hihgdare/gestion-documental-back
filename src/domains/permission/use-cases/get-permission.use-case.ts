import { Permission } from '../entities/permission.entity';
import { PermissionRepository } from '../repositories/permission.repository';

export class GetPermissionsUseCase {
  constructor(private readonly permissionRepository: PermissionRepository) {}

  async execute(): Promise<Permission[]> {
    return this.permissionRepository.findAll();
  }
}
