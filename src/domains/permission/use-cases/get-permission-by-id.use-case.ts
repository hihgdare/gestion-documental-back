import { Permission } from '../entities/permission.entity';
import { PermissionRepository } from '../repositories/permission.repository';

export class GetPermissionByIdUseCase {
  constructor(private readonly permissionRepository: PermissionRepository) {}

  async execute(id: number): Promise<Permission | null> {
    return this.permissionRepository.findById(id);
  }
}
