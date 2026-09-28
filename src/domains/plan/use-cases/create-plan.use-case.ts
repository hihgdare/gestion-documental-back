import { PlanRepository } from '../repositories/plan.repository';
import { Plan } from '../entities/plan.entity';
import { PlanBadge } from '../value-objects/plan-badge';
import { ValidationError } from '@shared/domain/errors';
import { FeatureRepository } from '@domains/feature/repositories/feature.repository';
import { resolveFeatureIds } from './resolve-feature-ids';

export interface CreatePlanInput {
  name: string;
  maxActiveColaborators?: number | null;
  maxActiveContracts?: number | null;
  maxDocuments?: number | null;
  maxStorageGb?: number | null;
  maxActiveUsers?: number | null;
  isVisible?: boolean;
  badge?: PlanBadge | null;
  featureIds?: string[];
}

export class CreatePlanUseCase {
  constructor(
    private readonly planRepository: PlanRepository,
    private readonly featureRepository: FeatureRepository,
  ) {}

  async execute(input: CreatePlanInput): Promise<Plan> {
    const { featureIds, ...planProps } = input;
    const exists = await this.planRepository.existsByName(planProps.name);
    if (exists) {
      throw new ValidationError(`Plan with name "${planProps.name}" already exists`, 'name');
    }

    const resolvedFeatureIds = featureIds ? await resolveFeatureIds(this.featureRepository, featureIds) : undefined;
    const plan = new Plan(planProps);
    return await this.planRepository.save(plan, resolvedFeatureIds);
  }
}
