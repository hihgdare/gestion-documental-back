import { GroupRepository } from '../repositories/group.repository';
import { UserRepository } from '@domains/user/repositories/user.repository';
import { GroupPlanRepository } from '@domains/plan/repositories/group-plan.repository';
import { PlanRepository } from '@domains/plan/repositories/plan.repository';
import { UserStatus } from '@domains/user/value-objects/user-status';
import { NotFoundError, PlanQuotaExceededError } from '@shared/domain/errors';
import { withGroupLock } from '@shared/domain/group-lock';

async function assertUserQuotaNotExceeded(
  groupId: number,
  isUserActive: boolean,
  userRepository: UserRepository,
  groupPlanRepository: GroupPlanRepository,
  planRepository: PlanRepository,
): Promise<void> {
  if (!isUserActive) return;

  const activeGroupPlan = await groupPlanRepository.findActiveByGroupId(groupId);
  if (!activeGroupPlan) return;

  const plan = await planRepository.findById(activeGroupPlan.planId);
  if (!plan || plan.maxActiveUsers === null) return;

  const currentCount = await userRepository.countActiveByGroupId(groupId);
  if (currentCount >= plan.maxActiveUsers) {
    throw new PlanQuotaExceededError('usuarios', plan.maxActiveUsers, currentCount);
  }
}

export class AddUserToGroupUseCase {
  constructor(
    private readonly groupRepository: GroupRepository,
    private readonly userRepository: UserRepository,
    private readonly groupPlanRepository: GroupPlanRepository,
    private readonly planRepository: PlanRepository,
  ) {}

  public async execute(groupId: number, userId: string, permission?: string): Promise<void> {
    const group = await this.groupRepository.findById(groupId);
    if (!group) throw new NotFoundError('Group', groupId.toString());

    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundError('User', userId);

    await withGroupLock(groupId, async () => {
      const alreadyMember = await this.groupRepository.isUserInGroup(groupId, userId);
      if (!alreadyMember) {
        await assertUserQuotaNotExceeded(
          groupId,
          user.status === UserStatus.ACTIVE,
          this.userRepository,
          this.groupPlanRepository,
          this.planRepository,
        );
      }

      await this.groupRepository.addUserToGroup(groupId, userId, permission);
    });
  }
}

export class RemoveUserFromGroupUseCase {
  constructor(
    private readonly groupRepository: GroupRepository,
    private readonly userRepository: UserRepository,
  ) {}

  public async execute(groupId: number, userId: string): Promise<void> {
    const group = await this.groupRepository.findById(groupId);
    if (!group) throw new NotFoundError('Group', groupId.toString());

    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundError('User', userId);

    await this.groupRepository.removeUserFromGroup(groupId, userId);
  }
}

export class AssignGroupToUserUseCase {
  constructor(
    private readonly groupRepository: GroupRepository,
    private readonly userRepository: UserRepository,
    private readonly groupPlanRepository: GroupPlanRepository,
    private readonly planRepository: PlanRepository,
  ) {}

  public async execute(userId: string, groupId: number, permission?: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundError('User', userId);

    const group = await this.groupRepository.findById(groupId);
    if (!group) throw new NotFoundError('Group', groupId.toString());

    await withGroupLock(groupId, async () => {
      const alreadyMember = await this.groupRepository.isUserInGroup(groupId, userId);
      if (!alreadyMember) {
        await assertUserQuotaNotExceeded(
          groupId,
          user.status === UserStatus.ACTIVE,
          this.userRepository,
          this.groupPlanRepository,
          this.planRepository,
        );
      }

      // Reuse the same logic as AddUserToGroupUseCase
      await this.groupRepository.addUserToGroup(groupId, userId, permission);
    });
  }
}
