import { UserRepository } from '@domains/user/repositories/user.repository';
import { JwtService } from '@shared/infrastructure/security/jwt.service';
import { UnauthorizedError } from '@shared/domain/errors';
import bcrypt from 'bcryptjs';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    roleId: string;
    status: string;
  };
  token: string;
}

export class LoginUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  public async execute(request: LoginRequest): Promise<LoginResponse> {
    // Find user by email
    const user = await this.userRepository.findByEmail(request.email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(request.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Check if user is active
    if (user.status !== 'active') {
      throw new UnauthorizedError('User account is not active');
    }

    // Generate JWT token
    const token = this.jwtService.generateToken({
      userId: user.id,
      email: user.email.toString(),
      roleId: user.roleId,
    });

    // Return user data and token
    return {
      user: {
        id: user.id,
        email: user.email.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        roleId: user.roleId,
        status: user.status,
      },
      token,
    };
  }
}
