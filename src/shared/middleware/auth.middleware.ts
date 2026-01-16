import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRepository } from '@domains/user/repositories/user.repository';
import { TypeOrmUserRepository } from '@shared/infrastructure/repositories/typeorm-user.repository';
import { User } from '@domains/user/entities/user.entity';
import { getToken, isRbacEnabled, parseCookies } from '@shared/utils/requests';
import { GroupRepository } from '@domains/group/repositories/group.repository';
import { TypeOrmGroupRepository } from '@shared/infrastructure/repositories/typeorm-group.repository';

// Extend the Request type to include the user property
declare module 'express-serve-static-core' {
  interface Request {
    user?: User;
    token?: string;
    groupId?: number;
  }
}

export async function auth(req: Request, res: Response, next: NextFunction) {
  if (!isRbacEnabled(req)) return next();

  try {
    const userRepository: UserRepository = new TypeOrmUserRepository();
    const groupRepository: GroupRepository = new TypeOrmGroupRepository();
    const cookies = parseCookies(req);
    const token = getToken(req.headers, cookies);
    if (token) {
      req.token = token;
      if ((process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') && token === 'skip-token') {
        return next();
      }
      const decodedToken: any = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkey');
      const user = await userRepository.findById(decodedToken.userId);
      if (!user) return res.status(401).json({ message: 'Unauthorized: User not found' });
      req.user = user;

      // Get groupId from cookie
      if (cookies?.groupId) {
        const groupId = parseInt(decodeURIComponent(cookies.groupId.trim()));
        const userGroup = await groupRepository.findByUserId(user.id);
        if (userGroup && userGroup.id === groupId) {
          req.groupId = groupId;
        }
      }

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
