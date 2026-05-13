export interface CreatePlanDto {
  name: string;
  maxActiveColaborators?: number | null;
  maxActiveContracts?: number | null;
  maxDocuments?: number | null;
}
