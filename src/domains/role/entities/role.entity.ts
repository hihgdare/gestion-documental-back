import { Permission } from "@domains/permission/entities/permission.entity";

export class Role {
  id!: number;
  name!: string;
  description?: string;
  permissions?: Permission[];

  constructor(data: Partial<Role>) {
    Object.assign(this, data);
  }
}
