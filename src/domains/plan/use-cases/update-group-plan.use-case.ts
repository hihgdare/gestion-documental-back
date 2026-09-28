import { GroupPlanRepository } from '../repositories/group-plan.repository';
import { GroupPlan } from '../entities/group-plan.entity';
import { NotFoundError } from '@shared/domain/errors';
import { withGroupLock } from '@shared/domain/group-lock';

export interface UpdateGroupPlanInput {
  id: string;
  startsAt?: Date;
  endsAt?: Date | null;
  isActive?: boolean;
}

export class UpdateGroupPlanUseCase {
  constructor(private readonly groupPlanRepository: GroupPlanRepository) {}

  async execute(input: UpdateGroupPlanInput): Promise<GroupPlan> {
    const groupPlan = await this.groupPlanRepository.findById(input.id);
    if (!groupPlan) {
      throw new NotFoundError('GroupPlan not found');
    }

    return withGroupLock(groupPlan.groupId, async () => {
      if (input.startsAt !== undefined) groupPlan.startsAt = input.startsAt;
      if (input.endsAt !== undefined) groupPlan.endsAt = input.endsAt;
      if (input.isActive !== undefined) groupPlan.isActive = input.isActive;

      groupPlan.updatedAt = new Date();
      const updated = await this.groupPlanRepository.update(groupPlan);
      if (updated.isActive) {
        await this.groupPlanRepository.deactivateOthers(updated.groupId, updated.id!);
      }
      return updated;
    });
  }
}

export class DeleteGroupPlanUseCase {
  constructor(private readonly groupPlanRepository: GroupPlanRepository) {}

  async execute(id: string): Promise<void> {
    const groupPlan = await this.groupPlanRepository.findById(id);
    if (!groupPlan) {
      throw new NotFoundError('GroupPlan not found');
    }
    await this.groupPlanRepository.delete(id);
  }
}
