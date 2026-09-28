import { GroupPlanRepository } from '../repositories/group-plan.repository';
import { PlanRepository } from '../repositories/plan.repository';
import { GroupPlan } from '../entities/group-plan.entity';
import { ValidationError } from '@shared/domain/errors';
import { GroupRepository } from '@domains/group/repositories/group.repository';
import { withGroupLock } from '@shared/domain/group-lock';

export interface ReplaceGroupPlanInput {
  groupId: number;
  planId: string;
  startsAt?: Date;
  endsAt?: Date | null;
}

export class ReplaceGroupPlanUseCase {
  constructor(
    private readonly groupPlanRepository: GroupPlanRepository,
    private readonly planRepository: PlanRepository,
    private readonly groupRepository: GroupRepository,
  ) {}

  async execute(input: ReplaceGroupPlanInput): Promise<GroupPlan> {
    const group = await this.groupRepository.findById(input.groupId);
    if (!group) {
      throw new ValidationError('Group not found', 'groupId');
    }

    const plan = await this.planRepository.findById(input.planId);
    if (!plan) {
      throw new ValidationError('Plan not found', 'planId');
    }

    return withGroupLock(input.groupId, async () => {
      const activeGroupPlan = await this.groupPlanRepository.findActiveByGroupId(input.groupId);

      if (activeGroupPlan && activeGroupPlan.planId === input.planId) {
        activeGroupPlan.startsAt = input.startsAt ?? activeGroupPlan.startsAt;
        activeGroupPlan.endsAt = input.endsAt !== undefined ? input.endsAt : activeGroupPlan.endsAt;
        const updated = await this.groupPlanRepository.update(activeGroupPlan);
        await this.groupPlanRepository.deactivateOthers(input.groupId, updated.id!);
        return updated;
      }

      const groupPlan = new GroupPlan({
        groupId: input.groupId,
        planId: input.planId,
        startsAt: input.startsAt,
        endsAt: input.endsAt ?? null,
        isActive: true,
      });

      const saved = await this.groupPlanRepository.save(groupPlan);
      await this.groupPlanRepository.deactivateOthers(input.groupId, saved.id!);
      return saved;
    });
  }
}
