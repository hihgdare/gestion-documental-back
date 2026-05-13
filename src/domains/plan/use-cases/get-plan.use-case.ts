import { PlanRepository } from '../repositories/plan.repository';
import { Plan } from '../entities/plan.entity';
import { NotFoundError } from '@shared/domain/errors';

export class GetPlanUseCase {
  constructor(private readonly planRepository: PlanRepository) {}

  async execute(id: string): Promise<Plan> {
    const plan = await this.planRepository.findById(id);
    if (!plan) {
      throw new NotFoundError('Plan not found');
    }
    return plan;
  }
}

export class ListPlansUseCase {
  constructor(private readonly planRepository: PlanRepository) {}

  async execute(): Promise<Plan[]> {
    return await this.planRepository.findAll();
  }
}
