import { ContractRepository } from '../repositories/contract.repository';
import { GroupPlanRepository } from '@domains/plan/repositories/group-plan.repository';
import { PlanRepository } from '@domains/plan/repositories/plan.repository';

export interface ContractQuota {
  current: number;
  limit: number | null;
  exceeded: boolean;
}

export class GetContractQuotaUseCase {
  constructor(
    private readonly contractRepository: ContractRepository,
    private readonly groupPlanRepository: GroupPlanRepository,
    private readonly planRepository: PlanRepository,
  ) {}

  public async execute(groupId: number): Promise<ContractQuota> {
    const current = await this.contractRepository.countActiveByGroupId(groupId);

    const activeGroupPlan = await this.groupPlanRepository.findActiveByGroupId(groupId);
    if (!activeGroupPlan) {
      return { current, limit: null, exceeded: false };
    }

    const plan = await this.planRepository.findById(activeGroupPlan.planId);
    const limit = plan?.maxActiveContracts ?? null;

    return {
      current,
      limit,
      exceeded: limit !== null && current >= limit,
    };
  }
}
