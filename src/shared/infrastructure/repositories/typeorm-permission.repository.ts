import { In, Repository } from 'typeorm';
import { AppDataSource } from '@shared/infrastructure/database/typeorm.config';
import { Permission } from '@domains/permission/entities/permission.entity';
import { PermissionEntity } from '@shared/infrastructure/database/entities/permission.entity';
import { PermissionRepository } from '@domains/permission/repositories/permission.repository';

export class TypeOrmPermissionRepository implements PermissionRepository {
  private repository: Repository<PermissionEntity>;

  constructor() {
    this.repository = AppDataSource.getRepository(PermissionEntity);
  }

  async findAll(): Promise<Permission[]> {
    const entities = await this.repository.find();
    return entities.map((entity) => new Permission(entity));
  }

  async findById(id: number): Promise<Permission | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? new Permission(entity) : null;
  }

  async findByName(name: string): Promise<Permission | null> {
    const entity = await this.repository.findOne({ where: { name } });
    return entity ? new Permission(entity) : null;
  }

  async findIn(ids: number[]): Promise<Permission[]> {
    const entities = await this.repository.findBy({ id: In(ids) });
    return entities.map((entity) => new Permission(entity));
  }

  async save(permission: Permission): Promise<Permission> {
    const savedEntity = await this.repository.save(permission);
    return new Permission(savedEntity);
  }

  async update(id: number, permission: Permission): Promise<Permission> {
    const result = await this.repository.update(id, permission);
    if (result.affected === 0) {
      throw new Error('Permission not found');
    }
    const updatedEntity = await this.repository.findOne({ where: { id } });
    if (!updatedEntity) {
      throw new Error('Permission not found');
    }
    return new Permission(updatedEntity as Permission);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}
