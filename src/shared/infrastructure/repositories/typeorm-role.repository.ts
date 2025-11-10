import { AppDataSource } from '../database/typeorm.config';
import { RoleEntity } from '../database/entities/role.entity';
import { Role } from '@domains/role/entities/role.entity';
import { RoleRepository } from '@domains/role/repositories/role.repository';
import { Repository } from 'typeorm';

export class TypeOrmRoleRepository implements RoleRepository {
  private repository: Repository<RoleEntity>;

  constructor() {
    this.repository = AppDataSource.getRepository(RoleEntity);
  }

  async create(role: Role): Promise<Role> {
    const entity = this.repository.create(role);
    const savedEntity = await this.repository.save(entity);
    return new Role(savedEntity);
  }

  async findByName(name: string): Promise<Role | null> {
    const entity = await this.repository.findOne({ where: { name } });
    return entity ? new Role(entity) : null;
  }

  async findById(id: number): Promise<Role | null> {
    const entity = await this.repository.findOne({ where: { id }, relations: ['permissions'] });
    return entity ? new Role(entity) : null;
  }

  async findAll(): Promise<Role[]> {
    const entities = await this.repository.find();
    return entities.map((entity) => new Role(entity));
  }

  async update(role: Role): Promise<Role> {
    const savedEntity = await this.repository.save(role);
    return new Role(savedEntity);
  }

  async delete(id: number): Promise<void> {
    const result = await this.repository.delete(id);
    if (result.affected === 0) {
      throw new Error('Role not found');
    }
  }
}
