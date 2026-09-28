import { describe, it, expect, mock } from 'bun:test';
import { AddUserToGroupUseCase, AssignGroupToUserUseCase } from './manage-group-users.use-case';
import { GroupRepository } from '../repositories/group.repository';
import { UserRepository } from '@domains/user/repositories/user.repository';
import { GroupPlanRepository } from '@domains/plan/repositories/group-plan.repository';
import { PlanRepository } from '@domains/plan/repositories/plan.repository';
import { GroupPlan } from '@domains/plan/entities/group-plan.entity';
import { Plan } from '@domains/plan/entities/plan.entity';
import { UserStatus } from '@domains/user/value-objects/user-status';
import { PlanQuotaExceededError } from '@shared/domain/errors';

function makeRepos(options: { alreadyMember: boolean }) {
  const groupRepository = {
    findById: mock(() => Promise.resolve({ id: 1, name: 'Grupo' })),
    isUserInGroup: mock(() => Promise.resolve(options.alreadyMember)),
    addUserToGroup: mock(() => Promise.resolve()),
  } as unknown as GroupRepository;
  const userRepository = {
    findById: mock(() => Promise.resolve({ id: 'user-id', status: UserStatus.ACTIVE })),
    countActiveByGroupId: mock(() => Promise.resolve(3)),
  } as unknown as UserRepository;
  const groupPlanRepository = {
    findActiveByGroupId: mock(() => Promise.resolve(new GroupPlan({ groupId: 1, planId: 'plan-id' }))),
  } as unknown as GroupPlanRepository;
  const planRepository = {
    findById: mock(() => Promise.resolve(new Plan({ name: 'Básico', maxActiveUsers: 3 }))),
  } as unknown as PlanRepository;
  return { groupRepository, userRepository, groupPlanRepository, planRepository };
}

describe.each([
  ['AddUserToGroupUseCase', (r: ReturnType<typeof makeRepos>) =>
    (groupId: number, userId: string) =>
      new AddUserToGroupUseCase(r.groupRepository, r.userRepository, r.groupPlanRepository, r.planRepository).execute(groupId, userId)],
  ['AssignGroupToUserUseCase', (r: ReturnType<typeof makeRepos>) =>
    (groupId: number, userId: string) =>
      new AssignGroupToUserUseCase(r.groupRepository, r.userRepository, r.groupPlanRepository, r.planRepository).execute(userId, groupId)],
] as const)('%s', (_name, build) => {
  it('lanza PlanQuotaExceededError si el usuario es nuevo y la cuota está llena', async () => {
    const repos = makeRepos({ alreadyMember: false });
    await expect(build(repos)(1, 'user-id')).rejects.toThrow(PlanQuotaExceededError);
    expect(repos.groupRepository.addUserToGroup).not.toHaveBeenCalled();
  });

  it('no revisa la cuota si el usuario ya es miembro del grupo', async () => {
    const repos = makeRepos({ alreadyMember: true });
    await build(repos)(1, 'user-id');
    expect(repos.userRepository.countActiveByGroupId).not.toHaveBeenCalled();
    expect(repos.groupRepository.addUserToGroup).toHaveBeenCalledTimes(1);
  });
});
