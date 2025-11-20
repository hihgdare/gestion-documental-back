import { Request, Response, NextFunction } from 'express';
import { LoginUserUseCase } from '@domains/user/use-cases/login-user.use-case';
import { GetAuthenticatedUserPermissionsUseCase } from '@domains/user/use-cases/get-authenticated-user-permissions.use-case';
import { ValidationError } from '@shared/domain/errors';
import jwt from 'jsonwebtoken';

// Extend the Request type to include the user property
declare module 'express-serve-static-core' {
  interface Request {
    user?: any; // Adjust 'any' to your User entity type if available
  }
}

export class AuthController {
  constructor(
    private readonly loginUserUseCase: LoginUserUseCase,
    private readonly getAuthenticatedUserPermissionsUseCase: GetAuthenticatedUserPermissionsUseCase,
  ) {
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.getPermissions = this.getPermissions.bind(this);
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw new ValidationError('Email and password are required', 'credentials');
      }

      const user = await this.loginUserUseCase.execute(email, password);

      // Generate JWT Token
      const token = jwt.sign(
        { userId: user.id, email: user.email.toString() },
        process.env.JWT_SECRET || 'supersecretjwtkey', // Use a strong secret from environment variables
        { expiresIn: '1h' }, // Token expires in 1 hour
      );

      res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // For JWTs, logout is typically handled client-side by discarding the token.
      // If a token blacklist or session management is needed, it would be implemented here.
      res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
      next(error);
    }
  }

  async getPermissions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new ValidationError('User not authenticated', 'authentication');
      }
      const permissions = await this.getAuthenticatedUserPermissionsUseCase.execute(req.user);
      res.status(200).json({ permissions });
    } catch (error) {
      next(error);
    }
  }
}
