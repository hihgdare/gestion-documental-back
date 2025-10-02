import { UserRepository } from '../repositories/user.repository';
import { User } from '../entities/user.entity';
import { NotFoundError, ConflictError } from '@shared/domain/errors';

export interface UpdateUserRequest {
  email?: string;
  firstName?: string;
  lastName?: string;
  roleId?: string;
}

export class UpdateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  public async execute(id: string, request: UpdateUserRequest): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User', id);
    }

    // Check if email is being updated and if it's already in use
    if (request.email && request.email !== user.email.toString()) {
      const existingUser = await this.userRepository.findByEmail(request.email);
      if (existingUser) {
        throw new ConflictError('Email is already in use by another user');
      }
      user.updateEmail(request.email);
    }

    // Update name if provided
    if (request.firstName || request.lastName) {
      user.updateName(
        request.firstName || user.firstName,
        request.lastName || user.lastName
      );
    }

    return await this.userRepository.update(user);
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