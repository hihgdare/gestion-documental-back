import { PlanBadge } from '@domains/plan/value-objects/plan-badge';

export interface UpdatePlanDto {
  name?: string;
  maxActiveColaborators?: number | null;
  maxActiveContracts?: number | null;
  maxDocuments?: number | null;
  maxStorageGb?: number | null;
  maxActiveUsers?: number | null;
  isVisible?: boolean;
  badge?: PlanBadge | null;
}
