import { UserRepository } from '@domains/user/repositories/user.repository';
import { ValidationError, NotFoundError, UnauthorizedError } from '@shared/domain/errors';
import { UserStatus } from '@domains/user/value-objects/user-status';
import * as bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

interface SetPasswordTokenPayload {
  userId: string;
  purpose: 'set-password';
}

export class SetPasswordUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(token: string, newPassword: string): Promise<void> {
    if (!newPassword || newPassword.length < 8) {
      throw new ValidationError('Password must be at least 8 characters long', 'newPassword');
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new UnauthorizedError('Server misconfiguration');
    }

    let payload: SetPasswordTokenPayload;
    try {
      payload = jwt.verify(token, secret) as SetPasswordTokenPayload;
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

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await this.userRepository.update({
      id: user.id,
      email: user.email.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      password: hashedPassword,
      status: UserStatus.ACTIVE,
      roles: user.roles,
      groups: user.groups,
      createdAt: user.createdAt,
      updatedAt: new Date(),
      deletedAt: user.deletedAt,
    });
  }
}
