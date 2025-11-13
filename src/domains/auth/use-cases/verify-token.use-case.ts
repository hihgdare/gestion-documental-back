import { UserRepository } from '@domains/user/repositories/user.repository';
import { JwtService } from '@shared/infrastructure/security/jwt.service';
import { User } from '@domains/user/entities/user.entity';
import { UnauthorizedError, NotFoundError } from '@shared/domain/errors';

export class VerifyTokenUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  public async execute(token: string): Promise<User> {
    // Verify and decode token
    const decoded = this.jwtService.verifyToken(token);

    // Find user by ID from token
    const user = await this.userRepository.findById(decoded.userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Check if user is still active
    if (user.status !== 'active') {
      throw new UnauthorizedError('User account is no longer active');
    }

    return user;
  }
}
