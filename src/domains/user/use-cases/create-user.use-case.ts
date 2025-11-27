import { UserRepository } from '@domains/user/repositories/user.repository';
import { RoleRepository } from '@domains/role/repositories/role.repository';
import { User } from '@domains/user/entities/user.entity';
import { ConflictError, ValidationError } from '@shared/domain/errors';
import bcrypt from 'bcryptjs';

export interface CreateUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  roleIds?: number[];
}

export class CreateUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly roleRepository: RoleRepository,
  ) {}

  public async execute(request: CreateUserRequest): Promise<User> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(request.email);
    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(request.password, 12);

    // Fetch roles
    const roles = await Promise.all(
      (request.roleIds || []).map(roleId => this.roleRepository.findById(roleId)),
    );
    if (roles.some(r => !r)) {
      throw new ValidationError('One or more roles not found');
    }

    // Create user
    const user = new User({
      email: request.email,
      firstName: request.firstName,
      lastName: request.lastName,
      password: hashedPassword,
      roles: roles.filter(r => r) as any,
    });

    return await this.userRepository.save(user);
  }
}
