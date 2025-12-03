export interface CreateColaboratorGroupDto {
  name: string;
  description?: string;
  colaborators?: any[];
}

export type UpdateColaboratorGroupDto = Partial<CreateColaboratorGroupDto>;
