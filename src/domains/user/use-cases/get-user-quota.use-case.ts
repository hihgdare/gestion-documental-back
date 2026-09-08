import { UserRepository } from '../repositories/user.repository';
import { GroupPlanRepository } from '@domains/plan/repositories/group-plan.repository';
import { PlanRepository } from '@domains/plan/repositories/plan.repository';

export interface UserQuota {
  current: number;
  limit: number | null;
  exceeded: boolean;
}

export class GetUserQuotaUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly groupPlanRepository: GroupPlanRepository,
    private readonly planRepository: PlanRepository,
  ) {}

  public async execute(groupId: number): Promise<UserQuota> {
    const current = await this.userRepository.countActiveByGroupId(groupId);

    const activeGroupPlan = await this.groupPlanRepository.findActiveByGroupId(groupId);
    if (!activeGroupPlan) {
      return { current, limit: null, exceeded: false };
    }

    const plan = await this.planRepository.findById(activeGroupPlan.planId);
    const limit = plan?.maxActiveUsers ?? null;

    return {
      current,
      limit,
      exceeded: limit !== null && current >= limit,
    };
  }
}
