import { GroupPlanRepository } from '../repositories/group-plan.repository';
import { GroupPlan } from '../entities/group-plan.entity';
import { NotFoundError } from '@shared/domain/errors';

export class GetGroupPlanUseCase {
  constructor(private readonly groupPlanRepository: GroupPlanRepository) {}

  async execute(id: string): Promise<GroupPlan> {
    const groupPlan = await this.groupPlanRepository.findById(id);
    if (!groupPlan) {
      throw new NotFoundError('GroupPlan not found');
    }
    return groupPlan;
  }
}

export class ListGroupPlansByGroupUseCase {
  constructor(private readonly groupPlanRepository: GroupPlanRepository) {}

  async execute(groupId: number): Promise<GroupPlan[]> {
    return await this.groupPlanRepository.findByGroupId(groupId);
  }
}

export class GetActiveGroupPlanUseCase {
  constructor(private readonly groupPlanRepository: GroupPlanRepository) {}

  async execute(groupId: number): Promise<GroupPlan | null> {
    return await this.groupPlanRepository.findActiveByGroupId(groupId);
  }
}
