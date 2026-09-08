import { UserRepository } from '../repositories/user.repository';
import { UpdateUserProps, User } from '../entities/user.entity';
import { UserStatus } from '../value-objects/user-status';
import { NotFoundError, ConflictError, PlanQuotaExceededError } from '@shared/domain/errors';
import { RoleRepository } from '@domains/role/repositories/role.repository';
import { GroupRepository } from '@domains/group/repositories/group.repository';
import { GroupPlanRepository } from '@domains/plan/repositories/group-plan.repository';
import { PlanRepository } from '@domains/plan/repositories/plan.repository';

export class UpdateUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly roleRepository: RoleRepository,
    private readonly groupRepository: GroupRepository,
    private readonly groupPlanRepository: GroupPlanRepository,
    private readonly planRepository: PlanRepository,
  ) {}

  public async execute(props: UpdateUserProps): Promise<User> {
    const user = await this.userRepository.findById(props.id);
    if (!user) {
      throw new NotFoundError('User', props.id);
    }

    // Check if email is being updated and if it's already in use
    if (props.email) {
      const emailStr = typeof props.email === 'string' ? props.email : props.email.toString();
      if (emailStr !== user.email.toString()) {
        const existingUser = await this.userRepository.findByEmail(emailStr);
        if (existingUser) {
          throw new ConflictError('Email is already in use by another user');
        }
      }
    }

    // Check plan quota before activating a previously inactive/suspended user
    if (props.status === UserStatus.ACTIVE && user.status !== UserStatus.ACTIVE) {
      const group = await this.groupRepository.findByUserId(user.id);
      if (group) {
        const activeGroupPlan = await this.groupPlanRepository.findActiveByGroupId(group.id!);
        if (activeGroupPlan) {
          const plan = await this.planRepository.findById(activeGroupPlan.planId);
          if (plan && plan.maxActiveUsers !== null) {
            const currentCount = await this.userRepository.countActiveByGroupId(group.id!);
            if (currentCount >= plan.maxActiveUsers) {
              throw new PlanQuotaExceededError('usuarios', plan.maxActiveUsers, currentCount);
            }
          }
        }
      }
    }

    return await this.userRepository.update(props);
  }
}

export class DeleteUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  public async execute(id: string): Promise<void> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User', id);
    }

    await this.userRepository.delete(id);
  }
}
