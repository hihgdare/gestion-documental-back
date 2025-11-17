import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  DeleteDateColumn,
} from 'typeorm';
import { EnumColumn } from '@shared/infrastructure/database/entities/utils/decorators';
import { RoleEntity } from './role.entity';
import { User } from '@domains/user/entities/user.entity';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ name: 'first_name', type: 'varchar', length: 100 })
  firstName!: string;

  @Column({ name: 'last_name', type: 'varchar', length: 100 })
  lastName!: string;

  @Column({ type: 'varchar', length: 255 })
  password!: string;

  @EnumColumn({ enum: ['active', 'inactive', 'suspended', 'pending'] })
  status!: 'active' | 'inactive' | 'suspended' | 'pending';

  @ManyToMany(() => RoleEntity, (role) => role.users)
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles?: RoleEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date;

  static fromDomain(user: User): UserEntity {
    const entity = new UserEntity();
    entity.id = user.id;
    entity.email = user.email.toString();
    entity.firstName = user.firstName;
    entity.lastName = user.lastName;
    entity.password = user.password;
    entity.status = user.status as any;
    entity.roles = user.roles?.map(RoleEntity.fromDomain);
    return entity;
  }

  static toDomain(entity: UserEntity): User {
    return new User({
      id: entity.id,
      email: entity.email,
      firstName: entity.firstName,
      lastName: entity.lastName,
      password: entity.password,
      status: entity.status,
      roles: entity.roles?.map(RoleEntity.toDomain) ?? [],
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt,
    });
  }
}
