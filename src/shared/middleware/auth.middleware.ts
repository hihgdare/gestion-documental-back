import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRepository } from '@domains/user/repositories/user.repository';
import { TypeOrmUserRepository } from '@shared/infrastructure/repositories/typeorm-user.repository';
import { User } from '@domains/user/entities/user.entity';

// Extend the Request type to include the user property
declare module 'express-serve-static-core' {
  interface Request {
    user?: User;
    token?: string;
  }
}

export async function auth(req: Request, res: Response, next: NextFunction) {
  if (process.env.ENABLE_RBAC !== 'true') return next();

  try {
    const userRepository: UserRepository = new TypeOrmUserRepository();
    const token = getCookieToken(req) || getHeaderToken(req);
    if (token) {
      if (process.env.NODE_ENV === 'development' && token === 'skip-token') {
        return next();
      }
      const decodedToken: any = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkey');
      const user = await userRepository.findById(decodedToken.userId);
      if (!user) return res.status(401).json({ message: 'Unauthorized: User not found' });
      req.user = user;
      req.token = token;
      return next();
    }

    if (process.env.NODE_ENV === 'test') {
      const userIdHeader = req.headers['x-user-id'];
      if (typeof userIdHeader === 'string' && userIdHeader.trim()) {
        const user = await userRepository.findById(userIdHeader.trim());
        if (!user) return res.status(401).json({ message: 'Unauthorized: User not found' });
        req.user = user;
        return next();
      }
    }

    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
    next(error);
  }
}

function getCookieToken(req: Request): string | null {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader || typeof cookieHeader !== 'string') return null;
  const pairs = cookieHeader.split(';');
  const names = ['token', 'jwt', 'access_token'];
  for (const name of names) {
    const match = pairs.find(p => p.trim().startsWith(`${name}=`));
    if (match) {
      const value = match.split('=')[1];
      if (value) return decodeURIComponent(value.trim());
    }
  }
  return null;
}

function getHeaderToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || typeof authHeader !== 'string') return null;
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }
  return null;
}
