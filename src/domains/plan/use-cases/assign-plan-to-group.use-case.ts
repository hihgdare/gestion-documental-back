import { GroupPlanRepository } from '../repositories/group-plan.repository';
import { PlanRepository } from '../repositories/plan.repository';
import { GroupPlan } from '../entities/group-plan.entity';
import { ValidationError } from '@shared/domain/errors';
import { GroupRepository } from '@domains/group/repositories/group.repository';

export interface AssignPlanToGroupInput {
  groupId: number;
  planId: string;
  startsAt?: Date;
  endsAt?: Date | null;
}

export class AssignPlanToGroupUseCase {
  constructor(
    private readonly groupPlanRepository: GroupPlanRepository,
    private readonly planRepository: PlanRepository,
    private readonly groupRepository: GroupRepository,
  ) {}

  async execute(input: AssignPlanToGroupInput): Promise<GroupPlan> {
    const group = await this.groupRepository.findById(input.groupId);
    if (!group) {
      throw new ValidationError('Group not found', 'groupId');
    }

    const plan = await this.planRepository.findById(input.planId);
    if (!plan) {
      throw new ValidationError('Plan not found', 'planId');
    }

    const groupPlan = new GroupPlan({
      groupId: input.groupId,
      planId: input.planId,
      startsAt: input.startsAt,
      endsAt: input.endsAt ?? null,
      isActive: true,
    });

    return await this.groupPlanRepository.save(groupPlan);
  }
}
