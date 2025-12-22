import { Request, Response, NextFunction, CookieOptions } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '@domains/user/entities/user.entity';
import { LoginUserUseCase } from '@domains/user/use-cases/login-user.use-case';
import { GetAuthenticatedUserPermissionsUseCase } from '@domains/user/use-cases/get-authenticated-user-permissions.use-case';
import { GetUserByIdUseCase } from '@domains/user/use-cases/get-user.use-case';
import { UpdateUserUseCase } from '@domains/user/use-cases/update-user.use-case';
import { ValidationError } from '@shared/domain/errors';

// Extend the Request type to include the user property
declare module 'express-serve-static-core' {
  interface Request {
    user?: User;
    token?: string;
  }
}

export class AuthController {
  constructor(
    private readonly loginUserUseCase: LoginUserUseCase,
    private readonly getAuthenticatedUserPermissionsUseCase: GetAuthenticatedUserPermissionsUseCase,
    private readonly getUserByIdUseCase: GetUserByIdUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
  ) {
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.getPermissions = this.getPermissions.bind(this);
    this.refresh = this.refresh.bind(this);
    this.getMe = this.getMe.bind(this);
    this.updateMe = this.updateMe.bind(this);
    this.getToken = this.getToken.bind(this);
  }

  private getCookieOptions(): CookieOptions {
    const secure = process.env.COOKIE_SECURE
      ? process.env.COOKIE_SECURE === 'true'
      : process.env.NODE_ENV === 'production';

    const sameSiteEnv = process.env.COOKIE_SAMESITE?.toLowerCase();
    const sameSite: CookieOptions['sameSite'] =
      sameSiteEnv === 'lax' || sameSiteEnv === 'strict' || sameSiteEnv === 'none'
        ? sameSiteEnv
        : 'strict';

    const maxAge = Number(process.env.COOKIE_MAX_AGE_MS || '3600000');

    return {
      httpOnly: true,
      secure,
      sameSite,
      maxAge,
    };
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
        process.env.JWT_SECRET || 'supersecretjwtkey',
        { expiresIn: '1h' },
      );

      res.cookie('token', token, this.getCookieOptions());

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          token,
          user: user.toJSON(),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { maxAge: _maxAge, ...clearOptions } = this.getCookieOptions();
      res.clearCookie('token', clearOptions);

      res.status(200).json({
        success: true,
        message: 'Logout successful',
      });
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
      res.status(200).json({
        success: true,
        data: { permissions },
      });
    } catch (error) {
      next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new ValidationError('User not authenticated', 'authentication');
      }

      // Generate new JWT Token
      const token = jwt.sign(
        { userId: req.user.id, email: req.user.email.toString() },
        process.env.JWT_SECRET || 'supersecretjwtkey',
        { expiresIn: '1h' },
      );

      res.cookie('token', token, this.getCookieOptions());

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: { token },
      });
    } catch (error) {
      next(error);
    }
  }

  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new ValidationError('User not authenticated', 'authentication');
      }

      const user = await this.getUserByIdUseCase.execute(req.user.id);

      const permissions = await this.getAuthenticatedUserPermissionsUseCase.execute(user);
      res.status(200).json({
        success: true,
        data: { ...user.toJSON(), permissions },
      });
    } catch (error) {
      next(error);
    }
  }

  async updateMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new ValidationError('User not authenticated', 'authentication');
      }

      const user = await this.updateUserUseCase.execute({
        id: req.user.id,
        ...req.body,
      });

      res.status(200).json({
        success: true,
        data: user.toJSON(),
        message: 'User updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async getToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Get token from cookie
      const cookieHeader = req.headers.cookie;
      let token: string | null = null;

      if (cookieHeader && typeof cookieHeader === 'string') {
        const pairs = cookieHeader.split(';');
        const names = ['token', 'jwt', 'access_token'];
        for (const name of names) {
          const match = pairs.find(p => p.trim().startsWith(`${name}=`));
          if (match) {
            const value = match.split('=')[1];
            if (value) {
              token = decodeURIComponent(value.trim());
              break;
            }
          }
        }
      }

      if (!token) {
        res.status(401).json({
          success: false,
          message: 'No token found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: { token },
      });
    } catch (error) {
      next(error);
    }
  }
}
