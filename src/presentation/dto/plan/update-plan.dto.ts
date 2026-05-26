export interface UpdatePlanDto {
  name?: string;
  maxActiveColaborators?: number | null;
  maxActiveContracts?: number | null;
  maxDocuments?: number | null;
  maxStorageGb?: number | null;
}
