import { ColaboratorRepository } from '../repositories/colaborator.repository';
import { GroupPlanRepository } from '@domains/plan/repositories/group-plan.repository';
import { PlanRepository } from '@domains/plan/repositories/plan.repository';

export interface ColaboratorQuota {
  current: number;
  limit: number | null;
  exceeded: boolean;
}

export class GetColaboratorQuotaUseCase {
  constructor(
    private readonly colaboratorRepository: ColaboratorRepository,
    private readonly groupPlanRepository: GroupPlanRepository,
    private readonly planRepository: PlanRepository,
  ) {}

  public async execute(groupId: number): Promise<ColaboratorQuota> {
    const current = await this.colaboratorRepository.countActiveByGroupId(groupId);

    const activeGroupPlan = await this.groupPlanRepository.findActiveByGroupId(groupId);
    if (!activeGroupPlan) {
      return { current, limit: null, exceeded: false };
    }

    const plan = await this.planRepository.findById(activeGroupPlan.planId);
    const limit = plan?.maxActiveColaborators ?? null;

    return {
      current,
      limit,
      exceeded: limit !== null && current >= limit,
    };
  }
}
