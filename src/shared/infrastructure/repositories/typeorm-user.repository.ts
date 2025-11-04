import { Repository } from 'typeorm';
import { type UserRepository } from '@domains/user/repositories/user.repository';
import { User, type UserProps } from '@domains/user/entities/user.entity';
import { UserStatus } from '@domains/user/value-objects/user-status';
import { UserEntity } from '../database/entities/user.entity';
import { AppDataSource } from '../database/typeorm.config';

export class TypeOrmUserRepository implements UserRepository {
  private repository: Repository<UserEntity>;

  constructor() {
    this.repository = AppDataSource.getRepository(UserEntity);
  }

  async findById(id: string): Promise<User | null> {
    const userEntity = await this.repository.findOne({ where: { id } });
    if (!userEntity) return null;
    return this.toDomain(userEntity);
  }

  async findAll(): Promise<User[]> {
    const userEntities = await this.repository.find({
      order: { createdAt: 'DESC' },
    });
    return userEntities.map(entity => this.toDomain(entity));
  }

  async save(user: User): Promise<User> {
    const userEntity = this.toEntity(user);
    const savedEntity = await this.repository.save(userEntity);
    return this.toDomain(savedEntity);
  }

  async update(user: User): Promise<User> {
    const userEntity = this.toEntity(user);
    await this.repository.update(user.id, userEntity);
    const updatedEntity = await this.repository.findOne({ where: { id: user.id } });
    return this.toDomain(updatedEntity!);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async findByEmail(email: string): Promise<User | null> {
    const userEntity = await this.repository.findOne({ where: { email } });
    if (!userEntity) return null;
    return this.toDomain(userEntity);
  }

  async findByStatus(status: string): Promise<User[]> {
    const userEntities = await this.repository.find({
      where: { status },
      order: { createdAt: 'DESC' },
    });
    return userEntities.map(entity => this.toDomain(entity));
  }

  async findByRoleId(roleId: string): Promise<User[]> {
    const userEntities = await this.repository.find({
      where: { roleId },
      order: { createdAt: 'DESC' },
    });
    return userEntities.map(entity => this.toDomain(entity));
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.repository.count({ where: { email } });
    return count > 0;
  }

  private toDomain(entity: UserEntity): User {
    const props: UserProps = {
      id: entity.id,
      email: entity.email,
      firstName: entity.firstName,
      lastName: entity.lastName,
      password: entity.password,
      status: entity.status as unknown as UserStatus,
      roleId: entity.roleId,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
    return User.fromPersistence(props);
  }

  private toEntity(user: User): Partial<UserEntity> {
    return {
      id: user.id,
      email: user.email.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      password: user.password,
      status: user.status,
      roleId: user.roleId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
