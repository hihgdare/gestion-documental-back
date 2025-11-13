import { Repository } from 'typeorm';
import { type UserRepository } from '@domains/user/repositories/user.repository';
import { User } from '@domains/user/entities/user.entity';
import { UserStatus } from '@domains/user/value-objects/user-status';
import { UserEntity } from '../database/entities/user.entity';
import { AppDataSource } from '../database/typeorm.config';
import { Role } from '@domains/role/entities/role.entity';
import { RoleEntity } from '../database/entities/role.entity';
import { Email } from '@domains/user/value-objects/email';

export class TypeOrmUserRepository implements UserRepository {
  private repository: Repository<UserEntity>;

  constructor() {
    this.repository = AppDataSource.getRepository(UserEntity);
  }

  async findAll(): Promise<User[]> {
    const userEntities = await this.repository.find({
      order: { createdAt: 'DESC' },
      relations: ['roles'],
    });
    return userEntities.map(entity => this.toDomain(entity));
  }

  async findById(id: string): Promise<User | null> {
    const userEntity = await this.repository.findOne({ where: { id }, relations: ['roles'] });
    if (!userEntity) return null;
    return this.toDomain(userEntity);
  }

  async findByRoleId(roleId: number): Promise<User[]> {
    const userEntities = await this.repository.find({
      where: { roles: { id: roleId } },
      order: { createdAt: 'DESC' },
      relations: ['roles'],
    });
    return userEntities.map(entity => this.toDomain(entity));
  }

  async assignRoleId(userId: string, roleId: number): Promise<void> {
    await this.repository.createQueryBuilder()
      .relation(UserEntity, 'roles')
      .of(userId)
      .add(roleId);
  }

  async save(user: User): Promise<User> {
    const userEntity = this.toEntity(user);
    const savedEntity = await this.repository.save(userEntity);
    return this.toDomain(savedEntity);
  }

  async update(id: string, user: User): Promise<User> {
    const userEntity = this.toEntity(user);
    await this.repository.update(id, {
      email: userEntity.email,
      firstName: userEntity.firstName,
      lastName: userEntity.lastName,
      password: userEntity.password,
      status: userEntity.status,
    });
    const current = await this.repository.findOne({ where: { id }, relations: ['roles'] });
    if (current) {
      await this.repository
        .createQueryBuilder()
        .relation(UserEntity, 'roles')
        .of(id)
        .remove(current.roles || []);
    }
    if (userEntity.roles && userEntity.roles.length) {
      await this.repository
        .createQueryBuilder()
        .relation(UserEntity, 'roles')
        .of(id)
        .add(userEntity.roles);
    }
    const updatedEntity = await this.repository.findOne({ where: { id }, relations: ['roles'] });
    return this.toDomain(updatedEntity!);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async findByEmail(email: string): Promise<User | null> {
    const userEntity = await this.repository.findOne({ where: { email }, relations: ['roles'] });
    if (!userEntity) return null;
    return this.toDomain(userEntity);
  }

  async findByStatus(status: UserStatus): Promise<User[]> {
    const userEntities = await this.repository.find({
      where: { status },
      order: { createdAt: 'DESC' },
      relations: ['roles'],
    });
    return userEntities.map(entity => this.toDomain(entity));
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.repository.count({ where: { email } });
    return count > 0;
  }

  private toDomain(entity: UserEntity): User {
    const roles = entity.roles ? entity.roles.map(roleEntity => new Role(roleEntity)) : [];
    return new User({
      id: entity.id,
      email: Email.create(entity.email),
      firstName: entity.firstName,
      lastName: entity.lastName,
      password: entity.password,
      status: entity.status as unknown as UserStatus,
      roles: roles,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  private toEntity(user: User): UserEntity {
    const userEntity = new UserEntity();
    userEntity.id = user.id;
    userEntity.email = user.email?.toString() || String(user.email);
    userEntity.firstName = user.firstName;
    userEntity.lastName = user.lastName;
    userEntity.password = user.password;
    userEntity.status = user.status;
    userEntity.roles = (user.roles || []).map(role => {
      const roleEntity = new RoleEntity();
      roleEntity.id = role.id;
      roleEntity.name = role.name;
      roleEntity.description = role.description;
      return roleEntity;
    });
    userEntity.createdAt = user.createdAt;
    userEntity.updatedAt = user.updatedAt;

    return userEntity;
  }
}
