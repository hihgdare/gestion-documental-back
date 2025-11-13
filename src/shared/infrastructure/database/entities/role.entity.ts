import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Role } from '@domains/role/entities/role.entity';
import { UserEntity } from '@shared/infrastructure/database/entities/user.entity';
import { EntityProps } from '@shared/infrastructure/entity-props';
import { PermissionEntity } from './permission.entity';

type RoleProps = EntityProps<Role, 'permissions' | 'parent' | 'children'>;

@Entity('roles')
export class RoleEntity implements RoleProps {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  name!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToMany(() => PermissionEntity, (permission) => permission.roles)
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
  })
  permissions!: PermissionEntity[];

  @ManyToMany(() => UserEntity, (user) => user.roles)
  users!: UserEntity[];

  @ManyToOne(() => RoleEntity, (role) => role.children, { nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent?: RoleEntity | null;

  @OneToMany(() => RoleEntity, (role) => role.parent)
  children?: RoleEntity[];

  static fromDomain(role: Role): RoleEntity {
    return Object.assign(new RoleEntity(), {
      id: role.id!,
      name: role.name,
      description: role.description,
      permissions: role.permissions?.map((p) => PermissionEntity.fromDomain(p)) ?? [],
      parent: role.parent ? RoleEntity.fromDomain(role.parent) : null,
      children: role.children?.map((c) => RoleEntity.fromDomain(c)) ?? [],
    });
  }

  static toDomain(entity: RoleEntity): Role {
    return new Role({
      id: entity.id,
      name: entity.name,
      description: entity.description,
      permissions: (entity.permissions || []).map((p) => PermissionEntity.toDomain(p)),
      parent: entity?.parent ? RoleEntity.toDomain(entity?.parent) : null,
      children: entity.children?.map((c) => RoleEntity.toDomain(c)) ?? [],
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}
