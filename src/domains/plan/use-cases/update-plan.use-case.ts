import { PlanRepository } from '../repositories/plan.repository';
import { GroupPlanRepository } from '../repositories/group-plan.repository';
import { Plan } from '../entities/plan.entity';
import { PlanBadge } from '../value-objects/plan-badge';
import { ConflictError, NotFoundError, ValidationError } from '@shared/domain/errors';
import { FeatureRepository } from '@domains/feature/repositories/feature.repository';
import { resolveFeatureIds } from './resolve-feature-ids';

export interface UpdatePlanInput {
  id: string;
  name?: string;
  maxActiveColaborators?: number | null;
  maxActiveContracts?: number | null;
  maxDocuments?: number | null;
  maxStorageGb?: number | null;
  maxActiveUsers?: number | null;
  isVisible?: boolean;
  badge?: PlanBadge | null;
  featureIds?: string[];
}

export class UpdatePlanUseCase {
  constructor(
    private readonly planRepository: PlanRepository,
    private readonly featureRepository: FeatureRepository,
  ) {}

  async execute(input: UpdatePlanInput): Promise<Plan> {
    const plan = await this.planRepository.findById(input.id);
    if (!plan) {
      throw new NotFoundError('Plan not found');
    }

    if (input.name !== undefined && input.name !== plan.name) {
      const exists = await this.planRepository.existsByName(input.name, input.id);
      if (exists) {
        throw new ValidationError(`Plan with name "${input.name}" already exists`, 'name');
      }
      plan.name = input.name;
    }

    if (input.maxActiveColaborators !== undefined) plan.maxActiveColaborators = input.maxActiveColaborators;
    if (input.maxActiveContracts !== undefined) plan.maxActiveContracts = input.maxActiveContracts;
    if (input.maxDocuments !== undefined) plan.maxDocuments = input.maxDocuments;
    if (input.maxStorageGb !== undefined) plan.maxStorageGb = input.maxStorageGb;
    if (input.maxActiveUsers !== undefined) plan.maxActiveUsers = input.maxActiveUsers;
    if (input.isVisible !== undefined) plan.isVisible = input.isVisible;
    if (input.badge !== undefined) plan.badge = input.badge;

    const resolvedFeatureIds = input.featureIds
      ? await resolveFeatureIds(this.featureRepository, input.featureIds)
      : undefined;

    plan.updatedAt = new Date();
    return await this.planRepository.update(plan, resolvedFeatureIds);
  }
}

export class DeletePlanUseCase {
  constructor(
    private readonly planRepository: PlanRepository,
    private readonly groupPlanRepository: GroupPlanRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const plan = await this.planRepository.findById(id);
    if (!plan) {
      throw new NotFoundError('Plan not found');
    }

    if (await this.groupPlanRepository.existsByPlanId(id)) {
      throw new ConflictError(
        'No se puede eliminar este plan porque está o estuvo asignado a uno o más grupos.',
      );
    }

    await this.planRepository.delete(id);
  }
}
