import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRepository } from '@domains/user/repositories/user.repository';
import { TypeOrmUserRepository } from '@shared/infrastructure/repositories/typeorm-user.repository';

// Extend the Request type to include the user property
declare module 'express-serve-static-core' {
  interface Request {
    user?: any; // Adjust 'any' to your User entity type if available
  }
}

export async function auth(req: Request, res: Response, next: NextFunction) {
  if (process.env.ENABLE_RBAC !== 'true') return next();

  try {
    const authHeader = req.headers.authorization;
    const userRepository: UserRepository = new TypeOrmUserRepository();

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decodedToken: any = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkey');
      const user = await userRepository.findById(decodedToken.userId);
      if (!user) return res.status(401).json({ message: 'Unauthorized: User not found' });
      req.user = user;
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
