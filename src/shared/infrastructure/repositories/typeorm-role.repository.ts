import { AppDataSource } from '@shared/infrastructure/database/typeorm.config';
import { RoleEntity } from '@shared/infrastructure/database/entities/role.entity';
import { Role } from '@domains/role/entities/role.entity';
import { RoleRepository } from '@domains/role/repositories/role.repository';
import { In, Repository } from 'typeorm';
import { PermissionEntity } from '@shared/infrastructure/database/entities/permission.entity';
import { Permission } from '@domains/permission/entities/permission.entity';
import { ConflictError } from '@shared/domain/errors';

export class TypeOrmRoleRepository implements RoleRepository {
  private repository: Repository<RoleEntity>;
  private permissionRepository: Repository<PermissionEntity>;

  constructor() {
    this.repository = AppDataSource.getRepository(RoleEntity);
    this.permissionRepository = AppDataSource.getRepository(PermissionEntity);
  }

  async findAll(): Promise<Role[]> {
    const entities = await this.repository.find({ relations: ['permissions', 'parent', 'children'] });
    return entities.map((entity) => this.toDomain(entity));
  }

  async findById(id: number): Promise<Role | null> {
    const entity = await this.repository.findOne({ where: { id }, relations: ['permissions', 'parent'] });
    return entity ? this.toDomain(entity) : null;
  }

  async findByName(name: string): Promise<Role | null> {
    const entity = await this.repository.findOne({ where: { name } });
    return entity ? this.toDomain(entity) : null;
  }

  async findIn(ids: number[]): Promise<Role[]> {
    const entities = await this.repository.find({ where: { id: In(ids) }, relations: ['permissions', 'parent'] });
    return entities.map((entity) => this.toDomain(entity));
  }

  async save(role: Role): Promise<Role> {
    let permissionEntities: PermissionEntity[] = []; // Declare here

    if (role.id) {
      throw new ConflictError('Role ID already exists');
    }

    const roleEntity: RoleEntity = this.repository.create(role); // Create a new RoleEntity from domain role

    if (role.permissions) {
      permissionEntities = await Promise.all(role.permissions.map(async (permission) => {
        const existingPermission = await this.permissionRepository.findOne({ where: { id: permission.id } });
        if (!existingPermission) {
          throw new Error(`Permission with ID ${permission.id} not found`);
        }
        return existingPermission;
      }));
    }

    const savedRoleEntity = await this.repository.save(roleEntity); // Save the role entity first

    // Manually update the many-to-many relationship
    if (role.permissions) { // This block should be executed only if role has permissions
      // Clear existing relations first
      await this.repository
        .createQueryBuilder()
        .relation(RoleEntity, 'permissions')
        .of(savedRoleEntity)
        .remove(savedRoleEntity.permissions || []); // Remove existing permissions

      // Add new permissions
      await this.repository
        .createQueryBuilder()
        .relation(RoleEntity, 'permissions')
        .of(savedRoleEntity)
        .add(permissionEntities);
    }

    // Fetch the saved role with its relations to return
    const finalSavedRole = await this.repository.findOne({ where: { id: savedRoleEntity.id }, relations: ['permissions', 'parent'] });
    if (!finalSavedRole) {
      throw new Error('Saved role not found after relation update');
    }

    return this.toDomain(finalSavedRole);
  }

  async update(id: number, role: Role): Promise<Role> {
    const { permissions, parent, children: _children, ...roleToUpdate } = role;
    const result = await this.repository.update(id, roleToUpdate);
    if (result.affected === 0) {
      throw new Error('Role not found');
    }
    if (parent !== undefined) {
      await this.repository
        .createQueryBuilder()
        .relation(RoleEntity, 'parent')
        .of(id)
        .set(parent ? parent.id! : null);
    }
    if (permissions) {
      const current = await this.repository.findOne({ where: { id }, relations: ['permissions'] });
      const permissionEntities = await this.permissionRepository.findBy({ id: In(permissions.map(p => p.id!)) });
      if (current) {
        await this.repository
          .createQueryBuilder()
          .relation(RoleEntity, 'permissions')
          .of(id)
          .remove(current.permissions || []);
      }
      await this.repository
        .createQueryBuilder()
        .relation(RoleEntity, 'permissions')
        .of(id)
        .add(permissionEntities);
    }
    const updatedEntity = await this.repository.findOne({ where: { id }, relations: ['permissions', 'parent'] });
    if (!updatedEntity) {
      throw new Error('Role not found');
    }
    return this.toDomain(updatedEntity);
  }

  async delete(id: number): Promise<void> {
    const result = await this.repository.delete(id);
    if (result.affected === 0) {
      throw new Error('Role not found');
    }
  }

  private toDomain(entity: RoleEntity): Role {
    const domainPermissions = (entity.permissions || []).map((p) => new Permission(p));
    const domainParent = entity.parent ? new Role({ id: entity.parent.id, name: entity.parent.name, description: entity.parent.description }) : null;
    return new Role({
      id: entity.id,
      name: entity.name,
      description: entity.description,
      permissions: domainPermissions,
      parent: domainParent ?? undefined,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    } as any);
  }
}
