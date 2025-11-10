import { AppDataSource } from '../database/typeorm.config';
import { PermissionEntity } from '../database/entities/permission.entity';
import { Permission } from '@domains/permission/entities/permission.entity';
import { PermissionRepository } from '@domains/permission/repositories/permission.repository';
import { In, Repository } from 'typeorm';

export class TypeOrmPermissionRepository implements PermissionRepository {
  private repository: Repository<PermissionEntity>;

  constructor() {
    this.repository = AppDataSource.getRepository(PermissionEntity);
  }

  async findIn(ids: number[]): Promise<Permission[]> {
    const entities = await this.repository.findBy({ id: In(ids) });
    return entities.map((entity) => new Permission(entity));
  }

  async create(permission: Permission): Promise<Permission> {
    const entity = this.repository.create(permission);
    const savedEntity = await this.repository.save(entity);
    return new Permission(savedEntity);
  }

  async findByName(name: string): Promise<Permission | null> {
    const entity = await this.repository.findOne({ where: { name } });
    return entity ? new Permission(entity) : null;
  }

  async findById(id: number): Promise<Permission | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? new Permission(entity) : null;
  }

  async findAll(): Promise<Permission[]> {
    const entities = await this.repository.find();
    return entities.map((entity) => new Permission(entity));
  }

  async update(permission: Permission): Promise<Permission> {
    const entity = await this.repository.findOne({ where: { id: permission.id } });
    if (!entity) {
      throw new Error('Permission not found');
    }
    const updatedEntity = await this.repository.save(permission);
    return new Permission(updatedEntity);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}
