export interface CreateRoleDto {
  name: string;
  description?: string;
}

export type UpdateRoleDto = Partial<CreateRoleDto>;
