import { PlanRepository } from '../repositories/plan.repository';
import { Plan } from '../entities/plan.entity';
import { FeatureRepository } from '@domains/feature/repositories/feature.repository';
import { NotFoundError, ValidationError } from '@shared/domain/errors';

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

    const uniqueIds = [...new Set(featureIds)];
    if (uniqueIds.length > 0) {
      const features = await this.featureRepository.findIn(uniqueIds);
      if (features.length !== uniqueIds.length) {
        throw new ValidationError('One or more features not found', 'featureIds');
      }
    }

    return this.planRepository.setFeatures(planId, uniqueIds);
  }
}
