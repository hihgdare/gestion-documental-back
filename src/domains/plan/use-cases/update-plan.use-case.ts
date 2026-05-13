import { PlanRepository } from '../repositories/plan.repository';
import { Plan } from '../entities/plan.entity';
import { NotFoundError, ValidationError } from '@shared/domain/errors';

export interface UpdatePlanInput {
  id: string;
  name?: string;
  maxActiveColaborators?: number | null;
  maxActiveContracts?: number | null;
  maxDocuments?: number | null;
}

export class UpdatePlanUseCase {
  constructor(private readonly planRepository: PlanRepository) {}

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

    plan.updatedAt = new Date();
    return await this.planRepository.update(plan);
  }
}

export class DeletePlanUseCase {
  constructor(private readonly planRepository: PlanRepository) {}

  async execute(id: string): Promise<void> {
    const plan = await this.planRepository.findById(id);
    if (!plan) {
      throw new NotFoundError('Plan not found');
    }
    await this.planRepository.delete(id);
  }
}
