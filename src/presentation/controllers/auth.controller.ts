import { Request, Response } from 'express';
import { LoginUseCase } from '@domains/auth/use-cases/login.use-case';
import { VerifyTokenUseCase } from '@domains/auth/use-cases/verify-token.use-case';
import { asyncHandler } from '@shared/middleware/validation';
import { UnauthorizedError } from '@shared/domain/errors';

export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly verifyTokenUseCase: VerifyTokenUseCase,
  ) {}

  public login = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.loginUseCase.execute(req.body);
    res.status(200).json({
      success: true,
      data: result,
      message: 'Login successful',
    });
  });

  public getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const user = await this.verifyTokenUseCase.execute(token);

    res.status(200).json({
      success: true,
      data: user.toJSON(),
    });
  });
}
