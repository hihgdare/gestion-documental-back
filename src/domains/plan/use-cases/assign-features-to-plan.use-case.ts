import { PlanRepository } from '../repositories/plan.repository';
import { Plan } from '../entities/plan.entity';
import { FeatureRepository } from '@domains/feature/repositories/feature.repository';
import { NotFoundError } from '@shared/domain/errors';
import { resolveFeatureIds } from './resolve-feature-ids';

export class AssignFeaturesToPlanUseCase {
  constructor(
    private readonly planRepository: PlanRepository,
    private readonly featureRepository: FeatureRepository,
  ) {}

  async execute(planId: string, featureIds: string[]): Promise<Plan> {
    const plan = await this.planRepository.findById(planId);
    if (!plan) {
      throw new NotFoundError('Plan not found');
    }

    const uniqueIds = await resolveFeatureIds(this.featureRepository, featureIds);
    return this.planRepository.setFeatures(planId, uniqueIds);
  }
}
