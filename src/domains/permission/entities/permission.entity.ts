export class Permission {
  id!: number;
  name!: string;
  description?: string;

  constructor(data: Partial<Permission>) {
    Object.assign(this, data);
  }
}
