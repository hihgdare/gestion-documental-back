import { UserRepository } from '@domains/user/repositories/user.repository';
import { ValidationError, NotFoundError, UnauthorizedError, PlanQuotaExceededError } from '@shared/domain/errors';
import { UserStatus } from '@domains/user/value-objects/user-status';
import { GroupRepository } from '@domains/group/repositories/group.repository';
import { GroupPlanRepository } from '@domains/plan/repositories/group-plan.repository';
import { PlanRepository } from '@domains/plan/repositories/plan.repository';
import { withGroupLock } from '@shared/infrastructure/database/group-lock';
import * as bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

interface SetPasswordTokenPayload {
  userId: string;
  nonce: string;
  purpose: 'set-password';
}

export class SetPasswordUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtSecret: string,
    private readonly groupRepository: GroupRepository,
    private readonly groupPlanRepository: GroupPlanRepository,
    private readonly planRepository: PlanRepository,
  ) {}

  async execute(token: string, newPassword: string): Promise<void> {
    if (!newPassword || newPassword.length < 8) {
      throw new ValidationError('Password must be at least 8 characters long', 'newPassword');
    }

    let payload: SetPasswordTokenPayload;
    try {
      payload = jwt.verify(token, this.jwtSecret) as SetPasswordTokenPayload;
    } catch {
      throw new UnauthorizedError('Invalid or expired token');
    }

    if (payload.purpose !== 'set-password') {
      throw new UnauthorizedError('Invalid token purpose');
    }

    const user = await this.userRepository.findById(payload.userId);
    if (!user) {
      throw new NotFoundError('User', payload.userId);
    }

    // Verify the nonce matches what is stored in the DB.
    // A mismatch means the token was already used or a newer activation
    // email was sent, invalidating this link.
    if (!user.passwordNonce || user.passwordNonce !== payload.nonce) {
      throw new UnauthorizedError('This activation link has already been used or has been superseded');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    const persist = () => this.userRepository.update({
      id: user.id,
      email: user.email.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      password: hashedPassword,
      status: UserStatus.ACTIVE,
      passwordNonce: null,
      roles: user.roles,
      groups: user.groups,
      createdAt: user.createdAt,
      updatedAt: new Date(),
      deletedAt: user.deletedAt,
    });

    // Check plan quota before activating a previously inactive/suspended user
    if (user.status !== UserStatus.ACTIVE) {
      const group = await this.groupRepository.findByUserId(user.id);
      if (group) {
        await withGroupLock(group.id!, async () => {
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

          await persist();
        });
        return;
      }
    }

    await persist();
  }
}
