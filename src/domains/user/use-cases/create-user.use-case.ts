import { UserRepository } from '../repositories/user.repository';
import { User, UserProps } from '../entities/user.entity';
import { ConflictError } from '@shared/domain/errors';
import bcrypt from 'bcryptjs';

export interface CreateUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  roleId: string;
}

export class CreateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  public async execute(request: CreateUserRequest): Promise<User> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(request.email);
    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(request.password, 12);

    // Create user
    const userProps: UserProps = {
      ...request,
      password: hashedPassword,
    };

    const user = User.create(userProps);
    
    return await this.userRepository.save(user);
  }
}