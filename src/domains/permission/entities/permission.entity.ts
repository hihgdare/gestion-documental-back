import { BaseEntity } from "@shared/domain/base-entity";
import { BaseProps } from "@shared/infrastructure/entity-props";

export type PermissionProps = BaseProps<Permission>;

export class Permission extends BaseEntity<Permission, number | null> {
  name: string;
  description?: string;

  constructor(data: Partial<Permission>) {
    super(data);
    this.name = data.name!;
    this.description = data.description;
  }

  toJSON(): PermissionProps {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
    };
  }
}
