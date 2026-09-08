import { PlanRepository } from '../repositories/plan.repository';
import { Plan } from '../entities/plan.entity';
import { PlanBadge } from '../value-objects/plan-badge';
import { ValidationError } from '@shared/domain/errors';

export interface CreatePlanInput {
  name: string;
  maxActiveColaborators?: number | null;
  maxActiveContracts?: number | null;
  maxDocuments?: number | null;
  maxStorageGb?: number | null;
  maxActiveUsers?: number | null;
  isVisible?: boolean;
  badge?: PlanBadge | null;
}

export class CreatePlanUseCase {
  constructor(private readonly planRepository: PlanRepository) {}

  async execute(input: CreatePlanInput): Promise<Plan> {
    const exists = await this.planRepository.existsByName(input.name);
    if (exists) {
      throw new ValidationError(`Plan with name "${input.name}" already exists`, 'name');
    }

    const plan = new Plan(input);
    return await this.planRepository.save(plan);
  }
}
