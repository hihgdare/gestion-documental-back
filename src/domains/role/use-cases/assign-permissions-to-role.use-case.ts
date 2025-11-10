import { RoleRepository } from '../repositories/role.repository';
import { PermissionRepository } from '../../permission/repositories/permission.repository';
import { Role } from '../entities/role.entity';

export class AssignPermissionsToRoleUseCase {
  constructor(
    private readonly roleRepository: RoleRepository,
    private readonly permissionRepository: PermissionRepository,
  ) {}

  async execute(input: { roleId: number; permissionIds: number[] }): Promise<Role> {
    const role = await this.roleRepository.findById(input.roleId);
    if (!role) {
      throw new Error('Role not found');
    }

    const permissions = await this.permissionRepository.findIn(input.permissionIds);

    if (permissions.length !== input.permissionIds.length) {
      throw new Error('One or more permissions not found');
    }

    role.permissions = permissions;

    return this.roleRepository.update(role);
  }
}
