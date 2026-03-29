import { UserRepository } from '@domains/user/repositories/user.repository';
import { User } from '@domains/user/entities/user.entity';
import * as bcrypt from 'bcryptjs';
import { ValidationError } from '@shared/domain/errors';

export class LoginUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(email: string, passwordInput: string): Promise<User> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new ValidationError('Invalid credentials', 'email');
    }

    const isPasswordValid = await bcrypt.compare(passwordInput, user.password);

    if (!isPasswordValid) {
      throw new ValidationError('Invalid credentials', 'password');
    }

    return user;
  }
}
