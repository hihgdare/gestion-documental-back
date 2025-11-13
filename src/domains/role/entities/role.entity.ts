import { Permission, PermissionProps } from "@domains/permission/entities/permission.entity";
import { BaseEntity } from "@shared/domain/base-entity";
import { BaseProps } from "@shared/infrastructure/entity-props";

export interface RoleProps extends BaseProps<Role, 'permissions' | 'parent' | 'children'> {
  permissions: PermissionProps[];
  parent?: RoleProps | null;
  children: RoleProps[];
}

export class Role extends BaseEntity<Role> {
  public id: number | null;
  public name: number | null;
  public description?: string;
  public permissions: Permission[];
  public parent?: Role | null;
  public children: Role[];
  public createdAt: Date;
  public updatedAt: Date;

  constructor(data: Partial<Role>) {
    super(data);
    this.name = data.name!;
    this.description = data.description;
    this.permissions = data.permissions || [];
    this.parent = data.parent ?? null;
    this.children = data.children ?? [];
  }

  toJSON(): RoleProps {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      permissions: this.permissions?.map((permission) => permission.toJSON()),
      parent: this.parent?.toJSON() ?? null,
      children: this.children?.map((child) => child.toJSON()) ?? [],
    };
  }
}
